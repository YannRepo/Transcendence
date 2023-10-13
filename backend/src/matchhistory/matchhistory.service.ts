import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MatchHistoryService {
	constructor(
		private prisma: PrismaService
	) {}

	//connectedClient: number[] = [];

	onModuleInit()
	{
		//console.log("on init MatchHistoryService");
	}

	async getMatchHistory()
	{
		return(null);
	}

	updateWaitingroom()
	{
		// console.log("update waitingroom");

	}
}
