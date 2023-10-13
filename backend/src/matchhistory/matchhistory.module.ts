import { Module } from '@nestjs/common';
import { MatchHistoryController } from './matchhistory.controller';
import { MatchHistoryService } from './matchhistory.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AtStrategy } from 'src/auth/strategies';

@Module({
	imports: [],
	controllers: [MatchHistoryController],
	providers: [MatchHistoryService, AuthService, JwtService, AtStrategy]
})
export class MatchhistoryModule {}
