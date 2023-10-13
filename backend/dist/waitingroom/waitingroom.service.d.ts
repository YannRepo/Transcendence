import { PrismaService } from 'src/prisma/prisma.service';
import { WaitingRoomDto } from './dto/waitingroom.dto';
export declare class Client {
    id: string;
    ready: boolean;
    constructor(id: string);
}
export declare class WaitingRoomService {
    private prisma;
    constructor(prisma: PrismaService);
    private connectedCient;
    connectedClient: number[];
    onModuleInit(): void;
    createGame(data: WaitingRoomDto): Promise<void>;
    updateWaitingroom(): void;
}
