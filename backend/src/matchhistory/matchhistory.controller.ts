import { Controller, Post, Get, Headers, Param } from "@nestjs/common";
import { MatchHistoryService } from "./matchhistory.service";
import { PrismaService } from "src/prisma/prisma.service";

@Controller("matchhistory")
export class MatchHistoryController {
  constructor(
    private usersService: MatchHistoryService,
    private prisma: PrismaService
  ) {}

  @Get("matchhistory")
  async getMatchHistory() {
    const matchHistory = await this.prisma.gameHistory.findMany();
    return matchHistory;
  }

  @Get("matchHistory/:id")
  async getMatchHistoryOfUserId(@Param("id") userId: string) {
    try {
      return await this.prisma.gameHistory.findMany({
        where: {
          OR: [{ idPlayer1: Number(userId) }, { idPlayer2: Number(userId) }],
        },
      });
    } catch(error) {
      return error
    }
  }
}
