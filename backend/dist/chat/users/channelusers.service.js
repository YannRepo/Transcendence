"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelUsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const channel_service_1 = require("../channel/channel.service");
let ChannelUsersService = exports.ChannelUsersService = class ChannelUsersService {
    constructor(prisma, channel) {
        this.prisma = prisma;
        this.channel = channel;
    }
    async joinChannel(dto) {
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
                role: client_1.ChannelUserRole.NORMAL
            },
            include: { user: true }
        }));
    }
    async disconnectClient(userId, channelId) {
        const channelUser = await this.getChannelUserByIds(userId, channelId);
        await this.prisma.channelUser.delete({ where: { id: Number(channelUser.id) } });
        if ((await this.prisma.channelUser.findMany({ where: { channelId: Number(channelId) } })).length === 0)
            await this.channel.deleteChannelById(channelId);
    }
    async setUserAdmin(user) {
        await this.prisma.channelUser.update({
            where: { id: user.id },
            data: { role: client_1.ChannelUserRole.ADMIN }
        });
    }
    async removeUserAdmin(user) {
        await this.prisma.channelUser.update({
            where: { id: user.id },
            data: { role: client_1.ChannelUserRole.NORMAL }
        });
    }
    async punishUser(userToMute, dto) {
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
    async unmuteUser(user, adminUsername) {
        let punishments = await this.getUserPunishments(user.userId, user.channelId);
        if (punishments === null)
            return;
        let punishment = null;
        for (let userPunishment of punishments) {
            if (userPunishment.type === 'mute') {
                punishment = userPunishment;
                break;
            }
        }
        if (punishment === null)
            return;
        await this.prisma.sourceBans.update({
            where: { id: punishment.id },
            data: {
                duration: -1,
                expireAt: new Date(),
                reason: `Unmuted by admin ${adminUsername}`
            }
        });
    }
    async blockUser(user, userIdToBlock) {
        user.blockedIds.push(userIdToBlock);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { blockedIds: user.blockedIds }
        });
    }
    async unblockUser(user, userIdToUnblock) {
        const index = user.blockedIds.indexOf(userIdToUnblock, 0);
        if (index > -1)
            user.blockedIds.splice(index, 1);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { blockedIds: user.blockedIds }
        });
    }
    async isSocketIdInArray(socketIdToCheck, arrOfSocketsId) {
        for (let socketId of arrOfSocketsId)
            if (socketId === socketIdToCheck)
                return true;
        return false;
    }
    async removeSocketIdFromChannelUserId(socketId, userId, exceptChannelId = -1) {
        let userInChannels;
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
    async getUserPunishments(userId, channelId) {
        const initialPunishments = await this.prisma.sourceBans.findMany({
            where: {
                userId: Number(userId),
                channelId: Number(channelId)
            }
        });
        if (initialPunishments.length === 0)
            return null;
        let dateNow;
        let currentPunishments = [];
        for (let punishment of initialPunishments) {
            if (punishment.duration === 0) {
                currentPunishments.push(punishment);
                continue;
            }
            dateNow = new Date();
            if (dateNow.getTime() < punishment.expireAt.getTime())
                currentPunishments.push(punishment);
        }
        return currentPunishments;
    }
    async getUserById(userId) {
        return (await this.prisma.user.findUnique({ where: { id: Number(userId) } }));
    }
    async getChannelUserByIds(userId, channelId) {
        if (String(userId) === "undefined")
            return;
        return (await this.prisma.channelUser.findFirst({
            where: {
                userId: Number(userId),
                channelId: Number(channelId)
            },
            include: { user: true }
        }));
    }
    async getUsersFromChannel(channelId) {
        return (await this.prisma.channelUser.findMany({
            where: { channelId: Number(channelId) },
            include: { user: true },
        }));
    }
};
exports.ChannelUsersService = ChannelUsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        channel_service_1.ChannelService])
], ChannelUsersService);
//# sourceMappingURL=channelusers.service.js.map