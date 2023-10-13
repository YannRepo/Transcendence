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
exports.ChannelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const auth_service_1 = require("../../auth/auth.service");
let ChannelService = exports.ChannelService = class ChannelService {
    constructor(prisma, auth) {
        this.prisma = prisma;
        this.auth = auth;
    }
    async createChannel(dto, withUser = null) {
        const user = await this.prisma.user.findFirst({
            where: { id: dto.userId }
        });
        if (dto.type === client_1.ChannelType.CONVERSATION && withUser != null) {
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
                                role: client_1.ChannelUserRole.NORMAL
                            },
                            {
                                user: { connect: { id: withUser.id } },
                                role: client_1.ChannelUserRole.NORMAL
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
                            role: client_1.ChannelUserRole.OWNER
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
    async getChannels() {
        return (await this.prisma.channel.findMany({
            where: {
                type: { not: client_1.ChannelType.CONVERSATION }
            },
            include: {
                channelUsers: {
                    include: { user: true }
                }
            }
        }));
    }
    async getUserConversations(fromUserId) {
        if (String(fromUserId) === "undefined")
            return;
        return (await this.prisma.channel.findMany({
            where: {
                type: client_1.ChannelType.CONVERSATION,
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
    async getChannelById(id) {
        let channel;
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
    async getChannelByName(name) {
        return (await this.prisma.channel.findFirst({ where: { name: name } }));
    }
    async setChannelName(id, name) {
        if (!(await this.getChannelById(id)))
            return;
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
    async setChannelDescription(id, description) {
        if (!(await this.getChannelById(id)))
            return;
        if (description != null && description.length > 100)
            return ({ error: "The description of the channel must contains at most 100 characters." });
        if (description !== null && (description.trim() === "" || description.length === 0))
            description = null;
        await this.prisma.channel.update({
            where: { id: Number(id) },
            data: { description: description }
        });
    }
    async setChannelPassword(channelId, password) {
        const channel = await this.getChannelById(channelId);
        if (!channel)
            return;
        if (password !== null && (password.trim() === "" || password.length === 0))
            password = null;
        await this.prisma.channel.update({
            where: { id: Number(channelId) },
            data: { password: (password === null) ? null : await this.auth.hashData(password) }
        });
        if (password !== null && channel.type !== client_1.ChannelType.PROTECTED)
            this.setChannelType(channelId, client_1.ChannelType.PROTECTED);
        else if (password === null && channel.type !== client_1.ChannelType.PUBLIC)
            this.setChannelType(channelId, client_1.ChannelType.PUBLIC);
    }
    async setChannelType(id, channType) {
        let type;
        const channel = await this.getChannelById(id);
        if (!channel)
            return;
        if (channType !== 'PUBLIC' && channType !== 'PROTECTED' && channType !== 'PRIVATE')
            return;
        else
            type = channType;
        if (channel.type === type)
            return;
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
    async deleteChannelById(id) {
        const channel = await this.getChannelById(id);
        if (!channel)
            return;
        await this.prisma.channelUser.deleteMany({ where: { channelId: Number(id) } });
        await this.prisma.channelMessage.deleteMany({ where: { channelId: Number(id) } });
        await this.prisma.channel.delete({ where: { id: Number(id) } });
    }
};
exports.ChannelService = ChannelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService])
], ChannelService);
//# sourceMappingURL=channel.service.js.map