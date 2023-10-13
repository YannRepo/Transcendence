import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelDto } from './dto';
import { Channel, ChannelType, User } from '@prisma/client';
import { ChannelUsersService } from '../users/channelusers.service';

@Controller('chat/channel')
export class ChannelController {
	constructor(private channelService: ChannelService,
				private channelUser: ChannelUsersService) {}

	// --------------------------------------------------
	// Channel CRUD
	// --------------------------------------------------
	// Create
	// --------------------------------------------------
	@UsePipes(new ValidationPipe({ always: true }))
	@Post('create')
	createChannel(@Body() dto: ChannelDto): Promise<Channel> {
		return this.channelService.createChannel(dto);
	}

	// --------------------------------------------------
	// Read
	// --------------------------------------------------
	@Get()
	getChannels(): Promise<Channel[]> {
		return this.channelService.getChannels();
	}

	@Get('conversations/:fromUserId')
	getConversations(@Param('fromUserId') fromUserId: number): Promise<Channel[]> {
		return this.channelService.getUserConversations(fromUserId);
	}

	@Get('id/:id')
	getChannelById(@Param('id') id: number) {
		return this.channelService.getChannelById(id);
	}

	@Get('name/:name')
	getChannelByName(@Param('name') name: string) {
		return this.channelService.getChannelByName(name);
	}

	// --------------------------------------------------
	// Update
	// --------------------------------------------------
	@Put(':id/name')
	setChannelName(@Param('id') id: number, @Body('name') name: string) {
		if (name === undefined)
			return ({ error: "No name given." });

		return this.channelService.setChannelName(id, name);
	}

	@Put(':id/description')
	setChannelDescription(@Param('id') id: number, @Body('description') description: string) {
		if (description === undefined)
			return ({ error: "No description given." });

		return this.channelService.setChannelDescription(id, description);
	}

	@Put(':id/password')
	setChannelPassword(@Param('id') id: number, @Body('password') password: string) {
		if (password === undefined)
			return ({ error: "No password given." });

		return this.channelService.setChannelPassword(id, password);
	}

	@UsePipes(new ValidationPipe({ always: true }))
	@Put(':id/type')
	setChannelType(@Param('id') id: number, @Body('type') type: ChannelType) {
		if (type === undefined)
			return ({ error: "No type given." });

		return this.channelService.setChannelType(id, type);
	}

	// --------------------------------------------------
	//Detete
	// --------------------------------------------------
	@Delete(':id')
	deleteChannelById(@Param('id') id: number) {
		return this.channelService.deleteChannelById(id);
	}
	// --------------------------------------------------

	@Get(':channelId/getUsers')
	getUsersFromChannel(@Param('channelId') channelId: number) {
		return this.channelUser.getUsersFromChannel(channelId);
	}

	@Get(':channelId/getUser/:userId')
	getUserFromChannelById(@Param('userId') userId: number, @Param('channelId') channelId: number) {
		return this.channelUser.getChannelUserByIds(userId, channelId);
	}

	@Get(':channelId/getUser/:userId/punishments')
	getUserPunishment(@Param('userId') userId: number, @Param('channelId') channelId: number) {
		return this.channelUser.getUserPunishments(userId, channelId);
	}
}
