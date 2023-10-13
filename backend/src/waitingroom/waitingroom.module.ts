import { Module } from '@nestjs/common';
import { WaitingRoomController } from './waitingroom.controller';
import { WaitingRoomService } from './waitingroom.service';
import { WaitingRoomGateway } from './waitingroom.gateway';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AtStrategy } from 'src/auth/strategies';


@Module({
	controllers: [WaitingRoomController],
	providers: [WaitingRoomService, WaitingRoomGateway, AuthService, JwtService, AtStrategy],
})
export class WaitingRoomModule {}
