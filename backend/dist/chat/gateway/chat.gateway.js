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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const argon = require("argon2");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const auth_service_1 = require("../../auth/auth.service");
const channelusers_service_1 = require("../users/channelusers.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const message_service_1 = require("../message/message.service");
const dto_1 = require("../channel/dto");
const channel_service_1 = require("../channel/channel.service");
const dto_2 = require("../message/dto");
const client_1 = require("@prisma/client");
const dto_3 = require("../users/dto");
const user_service_1 = require("../../auth/user/user.service");
let ChatGateway = exports.ChatGateway = class ChatGateway {
    constructor(auth, channel, channeluser, prisma, messages, user) {
        this.auth = auth;
        this.channel = channel;
        this.channeluser = channeluser;
        this.prisma = prisma;
        this.messages = messages;
        this.user = user;
        this.arr_connectedUsersId = [];
        this.arr_connectedSocketsId = [];
    }
    onModuleInit() { }
    async handleConnection(client) {
        if (!this.isSocketFromChat(client))
            return;
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        this.arr_connectedUsersId.push(user.id);
        this.arr_connectedSocketsId.push(client.id);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { inChat: true }
        });
        this.updateUserStatusForAll();
    }
    async handleDisconnect(client) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        const index = this.arr_connectedSocketsId.indexOf(client.id, 0);
        if (index > -1) {
            this.arr_connectedUsersId.splice(index, 1);
            this.arr_connectedSocketsId.splice(index, 1);
        }
        await this.channeluser.removeSocketIdFromChannelUserId(client.id, user.id);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { inChat: false }
        });
        this.updateUserStatusForAll();
    }
    async Event_OnChannelTurnedPrivate(client, status, channelId) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        if (!(await this.isUserAdmin(user, channelId, true)))
            return (this.server.to(client.id).emit('errorOmmited', "You must be the owner of the channel."));
        status = Boolean(status);
        if (status === true)
            await this.channel.setChannelType(channelId, client_1.ChannelType.PRIVATE);
        else if (status === false)
            await this.channel.setChannelType(channelId, client_1.ChannelType.PUBLIC);
        this.updateChannelForUsers(channelId);
        this.updateChannelListForUsers();
    }
    async Event_OnNameChanged(client, name, channelId) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        if (!(await this.isUserAdmin(user, channelId, true)))
            return (this.server.to(client.id).emit('errorOmmited', "You must be the owner of the channel."));
        name = name.trim();
        const res = await this.channel.setChannelName(channelId, name);
        if (res !== undefined)
            return (this.server.to(client.id).emit('errorOmmited', res.error));
        this.updateChannelForUsers(channelId);
        this.updateChannelListForUsers();
    }
    async Event_OnDescriptionChanged(client, description, channelId) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        if (!(await this.isUserAdmin(user, channelId, true)))
            return (this.server.to(client.id).emit('errorOmmited', "You must be the owner of the channel."));
        if (description != null)
            description = description.trim();
        const res = await this.channel.setChannelDescription(channelId, description);
        if (res !== undefined)
            return (this.server.to(client.id).emit('errorOmmited', res.error));
        this.updateChannelForUsers(channelId);
    }
    async Event_OnChannelPasswordChanged(client, password, channelId) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        if (!(await this.isUserAdmin(user, channelId, true)))
            return (this.server.to(client.id).emit('errorOmmited', "You must be the owner of the channel."));
        if (password != null)
            password = password.trim();
        await this.channel.setChannelPassword(channelId, password);
        this.updateChannelForUsers(channelId);
        this.updateChannelListForUsers();
    }
    async Event_OnAdminAdded(client, userToCheck) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        if (!(await this.isUserAdmin(user, userToCheck.channelId, true)))
            return (this.server.to(client.id).emit('errorOmmited', "You must be the owner of the channel."));
        if (await this.isUserAdmin(await this.channeluser.getUserById(userToCheck.userId), userToCheck.channelId, false))
            this.channeluser.removeUserAdmin(userToCheck);
        else
            this.channeluser.setUserAdmin(userToCheck);
        this.updateChannelForUsers(userToCheck.channelId);
    }
    async Event_OnUserKicked(client, userToKick, channelId) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        if (!(await this.isUserAdmin(user, channelId, false)))
            return (this.server.to(client.id).emit('errorOmmited', "You must be an administrator."));
        if (await this.isUserAdmin(await this.channeluser.getUserById(userToKick.userId), channelId, true))
            return (this.server.to(client.id).emit('errorOmmited', "You can't kick the owner of the channel."));
        for (const socketId of userToKick.socketIds)
            if (await this.isSocketIdConnected(socketId))
                this.server.to(socketId).emit('kickedMessage', `${user.username}`, channelId);
        this.channeluser.disconnectClient(userToKick.userId, channelId);
        this.updateChannelForUsers(channelId);
    }
    async Event_OnUserPunished(client, dto, channelId) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        if (!(await this.isUserAdmin(user, channelId, false)))
            return (this.server.to(client.id).emit('errorOmmited', "You must be an administrator."));
        const userToPunish = await this.channeluser.getChannelUserByIds(dto.userId, channelId);
        if (await this.isUserAdmin(await this.channeluser.getUserById(userToPunish.userId), channelId, true))
            return (this.server.to(client.id).emit('errorOmmited', `You can't ${dto.type} the owner of the channel.`));
        if (await this.isUserPunished(userToPunish, dto.type))
            return (this.server.to(client.id).emit('errorOmmited', `User ${userToPunish.user.username} is already ${dto.type}`));
        await this.channeluser.punishUser(userToPunish, dto);
        if (dto.type === 'ban') {
            for (const socketId of userToPunish.socketIds)
                if (await this.isSocketIdConnected(socketId))
                    this.server.to(socketId).emit('banned', dto, channelId);
            await this.channeluser.disconnectClient(userToPunish.userId, channelId);
        }
        else if (dto.type === 'mute') {
            for (const socketId of userToPunish.socketIds)
                if (await this.isSocketIdConnected(socketId))
                    this.server.to(socketId).emit('errorOmmited', `You have been muted by ${dto.adminUsername}.
    Duration: ${(Number(dto.duration) === 0) ? `permanent` : `${dto.duration} minutes`}`);
        }
        this.updateChannelForUsers(channelId);
    }
    async Event_OnUserUnmutted(client, userToUnmute) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        await this.channeluser.unmuteUser(userToUnmute, user.username);
        this.updateChannelForUsers(userToUnmute.channelId);
    }
    async Event_OnChannelCreated(client, dto) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        const channel = await this.channel.createChannel(dto);
        this.Event_OnChannelJoined(client, dto.password, channel);
        this.updateChannelListForUsers();
    }
    async Event_OnChannelJoined(client, password, channel) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        if (channel.type === 'PROTECTED')
            if (!await argon.verify(channel.password, password))
                return (this.server.to(client.id).emit('errorOmmited', "Password incorrect"));
        const channelUser = await this.channeluser.joinChannel({
            channelId: channel.id,
            userId: user.id
        });
        if (channelUser === null)
            return;
        let socketIds = channelUser.socketIds;
        let isSocketIdAlreadyExists = false;
        for (let socketId of socketIds) {
            if (socketId === client.id) {
                isSocketIdAlreadyExists = true;
                break;
            }
        }
        if (!isSocketIdAlreadyExists) {
            socketIds.push(client.id);
            await this.prisma.channelUser.update({
                where: { id: channelUser.id },
                data: { socketIds: socketIds }
            });
        }
        await this.channeluser.removeSocketIdFromChannelUserId(client.id, channelUser.userId, channelUser.channelId);
        this.server.to(client.id).emit('event_confirmJoinChannel', channel);
        this.server.to(client.id).emit('event_getMessagesFromChannel', await this.messages.getAllMessages(channel.id));
        this.updateChannelForUsers(channel.id);
    }
    async Event_OnConversationCreatedOrJoined(client, withUserId) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        const withUser = await this.user.getUserById(withUserId);
        let conversation = await this.getConversationWithUserIfExists(user, withUser);
        if (conversation !== null)
            return (this.server.to(client.id).emit('event_joinChannel', conversation));
        await this.channel.createChannel({
            name: null,
            description: null,
            password: null,
            type: client_1.ChannelType.CONVERSATION,
            userId: user.id
        }, withUser);
        conversation = await this.getConversationWithUserIfExists(user, withUser);
        this.server.to(client.id).emit('event_joinChannel', conversation);
        this.updateConversationListForUsers();
    }
    async Event_OnDisconnectedClient(client, channelId) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        const channeluser = await this.channeluser.getChannelUserByIds(user.id, channelId);
        for (const socketId of channeluser.socketIds)
            if (this.isSocketIdConnected(socketId))
                this.server.to(socketId).emit('event_disconnectChannel');
        await this.channeluser.disconnectClient(user.id, channelId);
        this.updateChannelForUsers(channelId);
        this.updateChannelListForUsers();
        this.updateConversationListForUsers();
    }
    async Event_OnNewMessage(client, body) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        const newMessage = await this.messages.saveNewMessage(body);
        const usersFromChannel = await this.channeluser.getUsersFromChannel(body.channelId);
        for (const channelUser of usersFromChannel) {
            for (const socketId of channelUser.socketIds)
                if (await this.isSocketIdConnected(socketId))
                    this.server.to(socketId).emit('listenForMessage', newMessage);
        }
        this.checkForChatAchievement(user.id, client.id);
    }
    async Event_OnUserBlocked(client, userIdToBlock, channelIdEmitted) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        if (!await this.isUserIdBlocked(user, userIdToBlock))
            await this.channeluser.blockUser(user, userIdToBlock);
        if (channelIdEmitted !== undefined) {
            await this.updateChannelForUsers(channelIdEmitted);
            this.server.to(client.id).emit('event_getMessagesFromChannel', await this.messages.getAllMessages(channelIdEmitted));
        }
        this.updateConversationListForUsers();
    }
    async Event_OnUserUnblocked(client, userIdToUnblock, channelIdEmitted) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        if (await this.isUserIdBlocked(user, userIdToUnblock))
            await this.channeluser.unblockUser(user, userIdToUnblock);
        if (channelIdEmitted !== undefined) {
            await this.updateChannelForUsers(channelIdEmitted);
            this.server.to(client.id).emit('event_getMessagesFromChannel', await this.messages.getAllMessages(channelIdEmitted));
        }
        this.updateConversationListForUsers();
    }
    async event_sendInvitationToPlay(client, toUser) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        for (const index in this.arr_connectedUsersId)
            if (this.arr_connectedUsersId[index] === toUser.userId)
                this.server.to(this.arr_connectedSocketsId[index]).emit('event_invitationToPlay', user.id, client.id);
    }
    async event_acceptInvitationToPlay(client, fromUserId, fromSocketId) {
        const user = await this.auth.getMe(client.handshake.auth.token);
        if (!user || String(user) === "null")
            return;
        if (await this.isUserAlreadyInGame(user.id))
            return this.server.to(client.id).emit('errorOmmited', "You are already in game, check all your open pages.");
        if (await this.isUserAlreadyInGame(fromUserId))
            return this.server.to(client.id).emit('errorOmmited', "The player who invited you is already in game.");
        await this.prisma.runningames.create({
            data: {
                name: this.generateName("game"),
                idPlayer1: Number(user.id),
                idPlayer2: Number(fromUserId)
            }
        });
        this.server.to(fromSocketId).emit('event_joinPong');
        this.server.to(client.id).emit('event_joinPong');
    }
    generateName(prefix) {
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const name = `${prefix}_${year}${month}${day}_${hours}${minutes}${seconds}`;
        return (name);
    }
    isSocketFromChat(client) {
        try {
            if (client.handshake.auth.socketType === 'chat')
                return true;
            return false;
        }
        catch (error) {
            return false;
        }
    }
    async isSocketIdConnected(socketId) {
        const sockets = await this.server.fetchSockets();
        for (const socket of sockets)
            if (socket.id === socketId)
                return true;
        return false;
    }
    async isUserAdmin(user, channelId, onlyOwner) {
        const userFromChannel = await this.channeluser.getChannelUserByIds(user.id, channelId);
        if (!userFromChannel)
            return false;
        if (Boolean(onlyOwner) === true) {
            if (userFromChannel.role === client_1.ChannelUserRole.OWNER)
                return true;
        }
        else if (userFromChannel.role === client_1.ChannelUserRole.OWNER || userFromChannel.role === client_1.ChannelUserRole.ADMIN)
            return true;
        return false;
    }
    async isUserPunished(user, type) {
        let punishments = await this.prisma.sourceBans.findMany({
            where: {
                userId: user.userId,
                channelId: user.channelId,
                type: type
            }
        });
        if (punishments === undefined || punishments.length === 0)
            return false;
        let dateNow = new Date();
        for (const punishment of punishments) {
            if (punishment.duration === 0)
                return true;
            if (punishment.expireAt.getTime() > dateNow.getTime())
                return true;
        }
        return false;
    }
    async isUserIdBlocked(user, userId) {
        const blockedIds = user.blockedIds;
        for (const id of blockedIds)
            if (id === userId)
                return true;
        return false;
    }
    async isUserAlreadyInGame(userId) {
        if (await this.prisma.runningames.findFirst({ where: { idPlayer1: Number(userId) } })
            || await this.prisma.runningames.findFirst({ where: { idPlayer2: Number(userId) } }))
            return true;
        return false;
    }
    async getConversationWithUserIfExists(fromUser, withUser) {
        const conversations = await this.channel.getUserConversations(fromUser.id);
        if (conversations.length === 0)
            return null;
        for (const conversation of conversations) {
            if (conversation.channelUsers.at(0).userId === fromUser.id &&
                conversation.channelUsers.at(1).userId === withUser.id)
                return conversation;
            else if (conversation.channelUsers.at(1).userId === fromUser.id &&
                conversation.channelUsers.at(0).userId === withUser.id)
                return conversation;
        }
        return null;
    }
    async updateChannelListForUsers() {
        for (const socketId of this.arr_connectedSocketsId)
            if (await this.isSocketIdConnected(socketId))
                this.server.to(socketId).emit('event_updateChannelList');
    }
    async updateConversationListForUsers() {
        for (const socketId of this.arr_connectedSocketsId)
            if (await this.isSocketIdConnected(socketId))
                this.server.to(socketId).emit('event_updateConversationList');
    }
    async updateChannelForUsers(channelId) {
        if (channelId === undefined)
            return;
        const usersFromChannel = await this.channeluser.getUsersFromChannel(channelId);
        for (const channelUser of usersFromChannel) {
            for (const socketId of channelUser.socketIds)
                if (await this.isSocketIdConnected(socketId))
                    this.server.to(socketId).emit('event_updateChannel');
        }
    }
    async updateUserStatusForAll() {
        for (const socketId of this.arr_connectedSocketsId) {
            if (await this.isSocketIdConnected(socketId))
                this.server.to(socketId).emit('event_updateChannelList');
            this.server.to(socketId).emit('event_updateConversationList');
            this.server.to(socketId).emit('event_updateChannel');
        }
    }
    async checkForChatAchievement(userId, socketId) {
        const user = await this.prisma.user.findUnique({
            where: { id: Number(userId) }
        });
        if (!user || String(user) === "null")
            return;
        if (Boolean(user.achievementChat) === true)
            return;
        const messagesFromUser = await this.prisma.channelMessage.findMany({
            where: { fromUserId: Number(userId) }
        });
        if (messagesFromUser.length >= 5) {
            await this.prisma.user.update({
                where: { id: Number(userId) },
                data: { achievementChat: true }
            });
            this.server.to(socketId).emit('event_achievementChatDone');
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_changeChannelPrivateStatus'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('status')),
    __param(2, (0, websockets_1.MessageBody)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Boolean, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnChannelTurnedPrivate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_changeChannelName'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('name')),
    __param(2, (0, websockets_1.MessageBody)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnNameChanged", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_changeChannelDescription'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('description')),
    __param(2, (0, websockets_1.MessageBody)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnDescriptionChanged", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_changeChannelPassword'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('password')),
    __param(2, (0, websockets_1.MessageBody)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnChannelPasswordChanged", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_changeAdminStatus'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnAdminAdded", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_kickUserFromChannel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('user')),
    __param(2, (0, websockets_1.MessageBody)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnUserKicked", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_punishUser'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __param(2, (0, websockets_1.MessageBody)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        dto_3.SourcebansDto, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnUserPunished", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_unmuteUser'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('user')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnUserUnmutted", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_createChannel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        dto_1.ChannelDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnChannelCreated", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_joinChannel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('password')),
    __param(2, (0, websockets_1.MessageBody)('channel')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnChannelJoined", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_createOrJoinConversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('withUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnConversationCreatedOrJoined", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_disconnectFromChannel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnDisconnectedClient", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_newMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket,
        dto_2.ChannelMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnNewMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_blockUser'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('userIdToBlock')),
    __param(2, (0, websockets_1.MessageBody)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnUserBlocked", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_unblockUser'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('userIdToUnblock')),
    __param(2, (0, websockets_1.MessageBody)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "Event_OnUserUnblocked", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_sendInvitationToPlay'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('toUser')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "event_sendInvitationToPlay", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('event_acceptInvitationToPlay'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('fromUserId')),
    __param(2, (0, websockets_1.MessageBody)('fromSocket')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Number, String]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "event_acceptInvitationToPlay", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "isSocketFromChat", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: "*" } }),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        channel_service_1.ChannelService,
        channelusers_service_1.ChannelUsersService,
        prisma_service_1.PrismaService,
        message_service_1.MessageService,
        user_service_1.UserService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map