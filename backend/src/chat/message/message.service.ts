import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ChannelMessageDto } from "./dto";
import { ChannelMessage } from "@prisma/client";

@Injectable()
export class MessageService {
	constructor(private prisma: PrismaService) {}

	async saveNewMessage(dto: ChannelMessageDto): Promise<ChannelMessage> {
		const user = await this.prisma.user.findUnique({
			where: { id: Number(dto.userId) }
		});
		if (!user)
			return ;

		return (await this.prisma.channelMessage.create({
			data: {
				channel: { connect: { id: Number(dto.channelId) } },
				fromUser: { connect: { id: Number(dto.userId) } },
				message: dto.message
			},
			include: { fromUser: true }
		}));
	}

	async getAllMessages(channelId: number): Promise<ChannelMessage[]> {
		const messages = await this.prisma.channelMessage.findMany({
			where: { channelId: Number(channelId) },
			include: { fromUser: true }
		});
		return messages;
	}
}
