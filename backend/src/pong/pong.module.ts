import { Module } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { JwtService } from '@nestjs/jwt';
import { AtStrategy } from 'src/auth/strategies';
import { AuthService } from 'src/auth/auth.service';


@Module({
	providers: [PongGateway, AuthService, JwtService, AtStrategy],
})
export class PongModule {}
