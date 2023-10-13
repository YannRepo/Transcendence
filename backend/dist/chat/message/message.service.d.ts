import { PrismaService } from "src/prisma/prisma.service";
import { ChannelMessageDto } from "./dto";
import { ChannelMessage } from "@prisma/client";
export declare class MessageService {
    private prisma;
    constructor(prisma: PrismaService);
    saveNewMessage(dto: ChannelMessageDto): Promise<ChannelMessage>;
    getAllMessages(channelId: number): Promise<ChannelMessage[]>;
}
