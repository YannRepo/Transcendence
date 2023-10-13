import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './gateway/chat.gateway';
import { MessageService } from './message/message.service';
import { ChannelModule } from './channel/channel.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AtStrategy } from 'src/auth/strategies';
import { ChannelService } from './channel/channel.service';
import { ChannelUsersService } from './users/channelusers.service';
import { UserService } from 'src/auth/user/user.service';

@Module({
	imports: [ChannelModule],
	controllers: [ChatController],
	providers: [ChatService, ChannelService, ChatGateway,
				MessageService, ChannelUsersService, AuthService,
				UserService, JwtService, AtStrategy]
})
export class ChatModule {}
