import { PrismaService } from 'src/prisma/prisma.service';
export declare class MatchHistoryService {
    private prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): void;
    getMatchHistory(): Promise<any>;
    updateWaitingroom(): void;
}
