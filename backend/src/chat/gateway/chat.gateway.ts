import * as argon from "argon2";
import { OnModuleInit } from "@nestjs/common";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthService } from "src/auth/auth.service";
import { ChannelUsersService } from "../users/channelusers.service";
import { PrismaService } from "src/prisma/prisma.service";
import { MessageService } from "../message/message.service";
import { ChannelDto } from "../channel/dto";
import { ChannelService } from "../channel/channel.service";
import { ChannelMessageDto } from "../message/dto";
import { Channel, ChannelType, ChannelUser, ChannelUserRole, User } from "@prisma/client";
import { SourcebansDto } from "../users/dto";
import { UserService } from "src/auth/user/user.service";

@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(private auth: AuthService,
				private channel: ChannelService,
				private channeluser: ChannelUsersService,
				private prisma: PrismaService,
				private messages: MessageService,
				private user: UserService) {}

	@WebSocketServer()
	private server: Server;

	private arr_connectedUsersId: number[] = [];
	private arr_connectedSocketsId: string[] = []; 

	onModuleInit() {}

	async handleConnection(@ConnectedSocket() client: Socket) {
		if (!this.isSocketFromChat(client))
			return ;

		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		this.arr_connectedUsersId.push(user.id);
		this.arr_connectedSocketsId.push(client.id);
		await this.prisma.user.update({
			where: { id: user.id },
			data: { inChat: true }
		});
		this.updateUserStatusForAll();
	}

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

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

	// --------------------------------------------------
	// Owner events
	// --------------------------------------------------
	@SubscribeMessage('event_changeChannelPrivateStatus')
	async Event_OnChannelTurnedPrivate(@ConnectedSocket() client: Socket,
		@MessageBody('status') status: boolean,
		@MessageBody('channelId') channelId: number)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		if (!(await this.isUserAdmin(user, channelId, true)))
			return (this.server.to(client.id).emit('errorOmmited', "You must be the owner of the channel."));

		status = Boolean(status);
		if (status === true)
			await this.channel.setChannelType(channelId, ChannelType.PRIVATE);
		else if (status === false)
			await this.channel.setChannelType(channelId, ChannelType.PUBLIC);

		this.updateChannelForUsers(channelId);
		this.updateChannelListForUsers();
	}

	@SubscribeMessage('event_changeChannelName')
	async Event_OnNameChanged(@ConnectedSocket() client: Socket,
			@MessageBody('name') name: string,
			@MessageBody('channelId') channelId: number)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		if (!(await this.isUserAdmin(user, channelId, true)))
			return (this.server.to(client.id).emit('errorOmmited', "You must be the owner of the channel."));

		name = name.trim();
		const res = await this.channel.setChannelName(channelId, name);
		if (res !== undefined)
			return (this.server.to(client.id).emit('errorOmmited', res.error));

		this.updateChannelForUsers(channelId);
		this.updateChannelListForUsers();
	}

	@SubscribeMessage('event_changeChannelDescription')
	async Event_OnDescriptionChanged(@ConnectedSocket() client: Socket,
		@MessageBody('description') description: string,
		@MessageBody('channelId') channelId: number)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		if (!(await this.isUserAdmin(user, channelId, true)))
			return (this.server.to(client.id).emit('errorOmmited', "You must be the owner of the channel."));

		if (description != null)
			description = description.trim();

		const res = await this.channel.setChannelDescription(channelId, description);
		if (res !== undefined)
			return (this.server.to(client.id).emit('errorOmmited', res.error));

		this.updateChannelForUsers(channelId);
	}

	@SubscribeMessage('event_changeChannelPassword')
	async Event_OnChannelPasswordChanged(@ConnectedSocket() client: Socket,
		@MessageBody('password') password: string,
		@MessageBody('channelId') channelId: number)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		if (!(await this.isUserAdmin(user, channelId, true)))
			return (this.server.to(client.id).emit('errorOmmited', "You must be the owner of the channel."));

		if (password != null)
			password = password.trim();

		await this.channel.setChannelPassword(channelId, password);
		this.updateChannelForUsers(channelId);
		this.updateChannelListForUsers();
	}

	@SubscribeMessage('event_changeAdminStatus')
	async Event_OnAdminAdded(@ConnectedSocket() client: Socket,
		@MessageBody('user') userToCheck: ChannelUser)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		if (!(await this.isUserAdmin(user, userToCheck.channelId, true)))
			return (this.server.to(client.id).emit('errorOmmited', "You must be the owner of the channel."));

		if (await this.isUserAdmin(await this.channeluser.getUserById(userToCheck.userId), userToCheck.channelId, false))
			this.channeluser.removeUserAdmin(userToCheck);
		else
			this.channeluser.setUserAdmin(userToCheck);

		this.updateChannelForUsers(userToCheck.channelId);
	}

	// --------------------------------------------------
	// Admin events
	// --------------------------------------------------
	@SubscribeMessage('event_kickUserFromChannel')
	async Event_OnUserKicked(@ConnectedSocket() client: Socket,
		@MessageBody('user') userToKick: ChannelUser,
		@MessageBody('channelId') channelId: number)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

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

	@SubscribeMessage('event_punishUser')
	async Event_OnUserPunished(@ConnectedSocket() client: Socket,
		@MessageBody() dto: SourcebansDto,
		@MessageBody('channelId') channelId: number)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

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

	@SubscribeMessage('event_unmuteUser')
	async Event_OnUserUnmutted(@ConnectedSocket() client: Socket,
		@MessageBody('user') userToUnmute: ChannelUser)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		await this.channeluser.unmuteUser(userToUnmute, user.username);
		this.updateChannelForUsers(userToUnmute.channelId);
	}

	// --------------------------------------------------
	// User events
	// --------------------------------------------------
	@SubscribeMessage('event_createChannel')
	async Event_OnChannelCreated(@ConnectedSocket() client: Socket,
		@MessageBody() dto: ChannelDto)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		const channel = await this.channel.createChannel(dto);
		this.Event_OnChannelJoined(client, dto.password, channel);
		this.updateChannelListForUsers();
	}

	@SubscribeMessage('event_joinChannel')
	async Event_OnChannelJoined(@ConnectedSocket() client: Socket,
		@MessageBody('password') password: string,
		@MessageBody('channel') channel: Channel)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		if (channel.type === 'PROTECTED')
			if (!await argon.verify(channel.password, password))
				return (this.server.to(client.id).emit('errorOmmited', "Password incorrect"));

		const channelUser = await this.channeluser.joinChannel({
			channelId: channel.id,
			userId: user.id
		});
		if (channelUser === null)
			return ;

		let socketIds = channelUser.socketIds;
		let isSocketIdAlreadyExists = false;
		for (let socketId of socketIds) {
			if (socketId === client.id) {
				isSocketIdAlreadyExists = true;
				break ;
			}
		}
		if (!isSocketIdAlreadyExists) {
			socketIds.push(client.id);
			await this.prisma.channelUser.update({
				where: { id: channelUser.id },
				data: { socketIds: socketIds }
			});
		}
		await this.channeluser.removeSocketIdFromChannelUserId(client.id,
			channelUser.userId,
			channelUser.channelId);
		this.server.to(client.id).emit('event_confirmJoinChannel', channel);
		this.server.to(client.id).emit('event_getMessagesFromChannel',
			await this.messages.getAllMessages(channel.id));

		this.updateChannelForUsers(channel.id);
	}

	@SubscribeMessage('event_createOrJoinConversation')
	async Event_OnConversationCreatedOrJoined(@ConnectedSocket() client: Socket,
		@MessageBody('withUserId') withUserId: number)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		const withUser = await this.user.getUserById(withUserId);
		let conversation = await this.getConversationWithUserIfExists(user, withUser);
		if (conversation !== null)
			return (this.server.to(client.id).emit('event_joinChannel', conversation));

		await this.channel.createChannel({
			name: null,
			description: null,
			password: null,
			type: ChannelType.CONVERSATION,
			userId: user.id
		}, withUser);
		conversation = await this.getConversationWithUserIfExists(user, withUser);
		this.server.to(client.id).emit('event_joinChannel', conversation);
		this.updateConversationListForUsers();
	}

	@SubscribeMessage('event_disconnectFromChannel')
	async Event_OnDisconnectedClient(@ConnectedSocket() client: Socket,
		@MessageBody('channelId') channelId: number)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		const channeluser = await this.channeluser.getChannelUserByIds(user.id, channelId);
		for (const socketId of channeluser.socketIds)
			if (this.isSocketIdConnected(socketId))
				this.server.to(socketId).emit('event_disconnectChannel');

		await this.channeluser.disconnectClient(user.id, channelId);
		this.updateChannelForUsers(channelId);
		this.updateChannelListForUsers();
		this.updateConversationListForUsers();
	}

	@SubscribeMessage('event_newMessage')
	async Event_OnNewMessage(@ConnectedSocket() client: Socket,
		@MessageBody() body: ChannelMessageDto)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		const newMessage = await this.messages.saveNewMessage(body);
		const usersFromChannel = await this.channeluser.getUsersFromChannel(body.channelId);

		for (const channelUser of usersFromChannel) {
			for (const socketId of channelUser.socketIds)
				if (await this.isSocketIdConnected(socketId))
					this.server.to(socketId).emit('listenForMessage', newMessage);
		}
		this.checkForChatAchievement(user.id, client.id);
	}

	@SubscribeMessage('event_blockUser')
	async Event_OnUserBlocked(@ConnectedSocket() client: Socket,
		@MessageBody('userIdToBlock') userIdToBlock: number,
		@MessageBody('channelId') channelIdEmitted: number)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		if (!await this.isUserIdBlocked(user, userIdToBlock))
			await this.channeluser.blockUser(user, userIdToBlock);

		if (channelIdEmitted !== undefined) {
			await this.updateChannelForUsers(channelIdEmitted);
			this.server.to(client.id).emit('event_getMessagesFromChannel',
				await this.messages.getAllMessages(channelIdEmitted));
		}
		this.updateConversationListForUsers();
	}

	@SubscribeMessage('event_unblockUser')
	async Event_OnUserUnblocked(@ConnectedSocket() client: Socket,
		@MessageBody('userIdToUnblock') userIdToUnblock: number,
		@MessageBody('channelId') channelIdEmitted: number)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		if (await this.isUserIdBlocked(user, userIdToUnblock))
			await this.channeluser.unblockUser(user, userIdToUnblock);

		if (channelIdEmitted !== undefined) {
			await this.updateChannelForUsers(channelIdEmitted);
			this.server.to(client.id).emit('event_getMessagesFromChannel',
				await this.messages.getAllMessages(channelIdEmitted));
		}

		this.updateConversationListForUsers();
	}

	@SubscribeMessage('event_sendInvitationToPlay')
	async event_sendInvitationToPlay(@ConnectedSocket() client: Socket,
		@MessageBody('toUser') toUser: ChannelUser)
	{
		// this.server.to(client.id).emit('event_joinPong');
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

		for (const index in this.arr_connectedUsersId)
			if (this.arr_connectedUsersId[index] === toUser.userId)
				this.server.to(this.arr_connectedSocketsId[index]).emit('event_invitationToPlay', user.id, client.id);
	}

	@SubscribeMessage('event_acceptInvitationToPlay')
	async event_acceptInvitationToPlay(@ConnectedSocket() client: Socket,
		@MessageBody('fromUserId') fromUserId: number,
		@MessageBody('fromSocket') fromSocketId: string)
	{
		const user = await this.auth.getMe(client.handshake.auth.token);
		if (!user || String(user) === "null")
			return ;

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

	// --------------------------------------------------
	// Utils
	// --------------------------------------------------
	generateName(prefix: string) {
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

	isSocketFromChat(@ConnectedSocket() client: Socket) {
		try {
			if (client.handshake.auth.socketType === 'chat')
				return true;

			return false;
		}
		catch(error) {
			return false;
		}
	}

	async isSocketIdConnected(socketId: string): Promise<boolean> {
		const sockets = await this.server.fetchSockets();

		for (const socket of sockets)
			if (socket.id === socketId)
				return true;

		return false;
	}

	async isUserAdmin(user: User, channelId: number, onlyOwner: boolean): Promise<boolean> {
		const userFromChannel = await this.channeluser.getChannelUserByIds(user.id, channelId);
		if (!userFromChannel)
			return false;

		if (Boolean(onlyOwner) === true) {
			if (userFromChannel.role === ChannelUserRole.OWNER)
				return true;
		}
		else
			if (userFromChannel.role === ChannelUserRole.OWNER || userFromChannel.role === ChannelUserRole.ADMIN)
				return true;

		return false;
	}

	async isUserPunished(user: ChannelUser, type: string): Promise<boolean> {
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

	async isUserIdBlocked(user: User, userId: number) {
		const blockedIds = user.blockedIds;

		for (const id of blockedIds)
			if (id === userId)
				return true;

		return false;
	}

	async isUserAlreadyInGame(userId: number): Promise<boolean> {
		if (await this.prisma.runningames.findFirst({ where: { idPlayer1: Number(userId) } })
			|| await this.prisma.runningames.findFirst({ where: { idPlayer2: Number(userId) } }))
			return true;

		return false;
	}

	async getConversationWithUserIfExists(fromUser: User, withUser: User) {
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

	async updateChannelForUsers(channelId: number) {
		if (channelId === undefined)
			return ;

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

	async checkForChatAchievement(userId: number, socketId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: Number(userId) }
		});
		if (!user || String(user) === "null")
			return ;

		if (Boolean(user.achievementChat) === true)
			return ;

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
}
