import { Injectable } from "@nestjs/common";
import { ChannelUser, ChannelUserRole, SourceBans, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { SourcebansDto, UserChannelDto } from "./dto";
import { ChannelService } from "../channel/channel.service";

@Injectable()
export class ChannelUsersService {
	constructor(private prisma: PrismaService,
				private channel: ChannelService) {}

	async joinChannel(dto: UserChannelDto) {
		const user = await this.getUserById(dto.userId);
		if (!user)
			return null;

		const channelUser = await this.getChannelUserByIds(dto.userId, dto.channelId);
		if (channelUser)
			return channelUser;

		return (await this.prisma.channelUser.create({
			data: {
				user: { connect: { id: Number(dto.userId) } },
				channel: { connect: { id: Number(dto.channelId) } },
				role: ChannelUserRole.NORMAL
			},
			include: { user: true }
		}));
	}

	async disconnectClient(userId: number, channelId: number) {
		const channelUser = await this.getChannelUserByIds(userId, channelId);

		await this.prisma.channelUser.delete({ where: { id: Number(channelUser.id) } });
		if ((await this.prisma.channelUser.findMany({ where: { channelId: Number(channelId) } })).length === 0)
			await this.channel.deleteChannelById(channelId);
	}

	async setUserAdmin(user: ChannelUser) {
		await this.prisma.channelUser.update({
			where: { id: user.id },
			data: { role: ChannelUserRole.ADMIN }
		});
	}

	async removeUserAdmin(user: ChannelUser) {
		await this.prisma.channelUser.update({
			where: { id: user.id },
			data: { role: ChannelUserRole.NORMAL }
		});
	}

	async punishUser(userToMute: ChannelUser, dto: SourcebansDto) {
		let expireDate = new Date();

		expireDate.setMinutes(expireDate.getMinutes() + Number(dto.duration));
		await this.prisma.sourceBans.create({
			data: {
				userId: userToMute.userId,
				channelId: Number(userToMute.channelId),
				adminUsername: dto.adminUsername,
				type: dto.type,
				expireAt: expireDate,
				duration: Number(dto.duration),
				reason: dto.reason
			}
		});
	}

	async unmuteUser(user: ChannelUser, adminUsername: string) {
		let punishments = await this.getUserPunishments(user.userId, user.channelId);

		if (punishments === null)
			return ;

		let punishment: SourceBans = null;
		for (let userPunishment of punishments) {
			if (userPunishment.type === 'mute') {
				punishment = userPunishment;
				break ;
			}
		}
		if (punishment === null)
			return ;

		await this.prisma.sourceBans.update({
			where: { id: punishment.id },
			data: {
				duration: -1,
				expireAt: new Date(),
				reason: `Unmuted by admin ${adminUsername}`
			}
		});
	}

	async blockUser(user: User, userIdToBlock: number) {
		user.blockedIds.push(userIdToBlock);

		await this.prisma.user.update({
			where: { id: user.id },
			data: { blockedIds: user.blockedIds }
		})
	}

	async unblockUser(user: User, userIdToUnblock: number) {
		const index = user.blockedIds.indexOf(userIdToUnblock, 0);

		if (index > -1)
			user.blockedIds.splice(index, 1);

		await this.prisma.user.update({
			where: { id: user.id },
			data: { blockedIds: user.blockedIds }
		})
	}

	async isSocketIdInArray(socketIdToCheck: string, arrOfSocketsId: string[]) {
		for (let socketId of arrOfSocketsId)
			if (socketId === socketIdToCheck)
				return true;

		return false;
	}

	async removeSocketIdFromChannelUserId(socketId: string,
		userId: number,
		exceptChannelId: number = -1)
	{
		let userInChannels: ChannelUser[];

		if (exceptChannelId === -1) {
			userInChannels = await this.prisma.channelUser.findMany({
				where: { userId: Number(userId) }
			});
		}
		else {
			userInChannels = await this.prisma.channelUser.findMany({
				where: {
					userId: Number(userId),
					channelId: { not: Number(exceptChannelId) }
				}
			});
		}
		for (let channelUser of userInChannels) {
			if (await this.isSocketIdInArray(socketId, channelUser.socketIds)) {
				const index = channelUser.socketIds.indexOf(socketId, 0);
				if (index > -1)
					channelUser.socketIds.splice(index, 1);

				await this.prisma.channelUser.update({
					where: { id: channelUser.id },
					data: { socketIds: channelUser.socketIds }
				});
			}
		}
	}

	async getUserPunishments(userId: number, channelId: number): Promise<SourceBans[]> {
		const initialPunishments = await this.prisma.sourceBans.findMany({
			where: {
				userId: Number(userId),
				channelId: Number(channelId)
			}
		});
		if (initialPunishments.length === 0)
			return null;

		let dateNow;
		let currentPunishments: SourceBans[] = [];
		for (let punishment of initialPunishments) {
			if (punishment.duration === 0) {
				currentPunishments.push(punishment);
				continue ;
			}
			dateNow = new Date();
			if (dateNow.getTime() < punishment.expireAt.getTime())
				currentPunishments.push(punishment);
		}
		return currentPunishments;
	}

	async getUserById(userId: number): Promise<User> {
		return (await this.prisma.user.findUnique({ where: { id: Number(userId) }}));
	}

	async getChannelUserByIds(userId: number, channelId: number) {
		if (String(userId) === "undefined")
			return ;

		return (await this.prisma.channelUser.findFirst({
			where: {
				userId: Number(userId),
				channelId: Number(channelId)
			},
			include: { user: true }
		}));
	}

	async getUsersFromChannel(channelId: number) {
		return (await this.prisma.channelUser.findMany({
			where: { channelId: Number(channelId) },
			include: { user: true },
		}));
	}
}