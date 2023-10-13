// users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { WaitingRoomDto } from './dto/waitingroom.dto';

export class Client
{
	id: string;
	ready: boolean;

	constructor(id: string)
	{
		this.ready = false;
		this.id = id;
	}
}

@Injectable()
export class WaitingRoomService {
	constructor(private prisma: PrismaService) {}

	private connectedCient: Map<string, Client> = new Map();
	connectedClient: number[] = [];

	onModuleInit()
	{
		//console.log("on init waitingroom");
		setInterval(() => {
			this.updateWaitingroom();
		}, 200);
	}

	async createGame(data: WaitingRoomDto) {
		//console.log("test exec post");
		//console.log(data);
	// 	return this.prisma.runningames.create({
	// 	data,
	// });
	this.connectedClient.push(1);
	}

	updateWaitingroom()
	{
		// console.log("update waitingroom");

	}
}
