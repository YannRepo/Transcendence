import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Channel, ChannelType, ChannelUserRole, User } from '@prisma/client';
import { ChannelDto } from './dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ChannelService {
	constructor(private prisma: PrismaService,
				private auth: AuthService) {}

	// --------------------------------------------------
	// Channel CRUD
	// --------------------------------------------------
	async createChannel(dto: ChannelDto, withUser: User = null): Promise<Channel> {
		const user = await this.prisma.user.findFirst({
			where: { id: dto.userId }
		});

		if (dto.type === ChannelType.CONVERSATION && withUser != null) {
			return (await this.prisma.channel.create({
				data: {
					name: dto.name,
					description: dto.description,
					password: (dto.password === null) ? null : await this.auth.hashData(dto.password),
					type: dto.type,
					channelUsers: {
						create: [
							{
								user: { connect: { id: dto.userId } },
								role: ChannelUserRole.NORMAL
							},
							{
								user: { connect: { id: withUser.id } },
								role: ChannelUserRole.NORMAL
							}
						]
					}
				},
				include: {
					channelUsers: {
						include: { user: true }
					}
				}
			}));
		}
		return (await this.prisma.channel.create({
			data: {
				name: dto.name,
				description: dto.description,
				password: (dto.password === null) ? null : await this.auth.hashData(dto.password),
				type: dto.type,
				channelUsers: {
					create: [
						{
							user: { connect: { id: dto.userId } },
							role: ChannelUserRole.OWNER
						}
					]
				},
			},
			include: {
				channelUsers: {
					include: { user: true }
				}
			}
		}));
	}

	async getChannels(): Promise<Channel[]> {
		return (await this.prisma.channel.findMany({
			where: {
				type: { not: ChannelType.CONVERSATION }
			},
			include: {
				channelUsers: {
					include: { user: true }
				}
			}
		}));
	}

	async getUserConversations(fromUserId: number) {
		if (String(fromUserId) === "undefined")
			return ;

		return (await this.prisma.channel.findMany({
			where: {
				type: ChannelType.CONVERSATION,
				channelUsers: {
					some: {
						userId: Number(fromUserId)
					}
				}
			},
			include: {
				channelUsers: {
					include: { user: true }
				}
			}
		}));
	}

	async getChannelById(id: number): Promise<Channel> {
		let channel: Channel;

		const channelId = Number(id);
		if (isNaN(channelId))
			return channel;

		return (await this.prisma.channel.findUnique({
			where: { id: channelId },
			include: {
				channelUsers: {
					include: { user: true }
				}
			}
		}));
	}

	async getChannelByName(name: string): Promise<Channel> {
		return (await this.prisma.channel.findFirst({ where: { name: name }}));
	}

	async setChannelName(id: number, name: string) {
		if (!(await this.getChannelById(id)))
			return ;

		if (await this.getChannelByName(name))
			return ({ error: "Channel name already exists, it must be unique." });

		if (name.length === 0)
			return ({ error: "The name of the channel must contains at least 1 character." });
		
		if (name.length > 40)
			return ({ error: "The name of the channel must contains at most 40 characters." });

		await this.prisma.channel.update({
			where: { id: Number(id) },
			data: { name: name }
		});
	}

	async setChannelDescription(id: number, description: string) {
		if (!(await this.getChannelById(id)))
			return ;

		if (description != null && description.length > 100)
			return ({ error: "The description of the channel must contains at most 100 characters." });

		if (description !== null && (description.trim() === "" || description.length === 0))
			description = null;

		await this.prisma.channel.update({
			where: { id: Number(id) },
			data: { description: description }
		});
	}

	async setChannelPassword(channelId: number, password: string) {
		const channel = await this.getChannelById(channelId);
		if (!channel)
			return ;

		if (password !== null && (password.trim() === "" || password.length === 0))
			password = null;

		await this.prisma.channel.update({
			where: { id: Number(channelId) },
			data: { password: (password === null) ? null : await this.auth.hashData(password) }
		});
		if (password !== null && channel.type !== ChannelType.PROTECTED)
			this.setChannelType(channelId, ChannelType.PROTECTED);
		else if (password === null && channel.type !== ChannelType.PUBLIC)
			this.setChannelType(channelId, ChannelType.PUBLIC);
	}

	async setChannelType(id: number, channType: ChannelType) {
		let type: ChannelType;

		const channel = await this.getChannelById(id);
		if (!channel)
			return ;

		if (channType !== 'PUBLIC' && channType !== 'PROTECTED' && channType !== 'PRIVATE')
			return ;
		else
			type = channType;

		if (channel.type === type)
			return ;

		await this.prisma.channel.update({
			where: { id: Number(id) },
			data: { type: type }
		});
		if (channel.password && (type === 'PUBLIC' || type == 'PRIVATE')) {
			await this.prisma.channel.update({
				where: { id: Number(id) },
				data: { password: null }
			});
		}
	}

	async deleteChannelById(id: number) {
		const channel = await this.getChannelById(id);
		if (!channel)
			return ;

		await this.prisma.channelUser.deleteMany({ where: { channelId: Number(id) }});
		await this.prisma.channelMessage.deleteMany({ where: { channelId: Number(id) }});
		await this.prisma.channel.delete({ where: { id: Number(id) }});
	}
	// --------------------------------------------------
}
