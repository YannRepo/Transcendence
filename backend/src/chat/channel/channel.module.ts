import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { ChannelUsersService } from '../users/channelusers.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AtStrategy } from 'src/auth/strategies';

@Module({
	controllers: [ChannelController],
	providers: [ChannelService, ChannelUsersService, AuthService, JwtService, AtStrategy]
})
export class ChannelModule {}
