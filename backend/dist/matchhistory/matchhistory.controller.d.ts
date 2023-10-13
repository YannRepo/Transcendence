import { MatchHistoryService } from "./matchhistory.service";
import { PrismaService } from "src/prisma/prisma.service";
export declare class MatchHistoryController {
    private usersService;
    private prisma;
    constructor(usersService: MatchHistoryService, prisma: PrismaService);
    getMatchHistory(): Promise<{
        id: number;
        date: Date;
        idPlayer1: number;
        idPlayer2: number;
        scorePlayer1: number;
        scorePlayer2: number;
        idWinner: number;
    }[]>;
    getMatchHistoryOfUserId(userId: string): Promise<any>;
}
