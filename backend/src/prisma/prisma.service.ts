import { PrismaClient } from "@prisma/client";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // datasources: {
      //     db: {
      //         url : process.env.DATABASE_URL,
      //     },
      // },
    });
  }
  async onModuleInit() {
    //await new Promise(resolve => setTimeout(resolve, 30000));
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
