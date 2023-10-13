import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { AuthMiddleware } from "./auth/middlewares/auth.middleware";
import { PrismaModule } from "./prisma/prisma.module";
import { ConfigModule } from "@nestjs/config";
import { ChatModule } from "./chat/chat.module";
import { AuthService } from "./auth/auth.service";
import { RefreshTokenMiddleware } from "./auth/middlewares/refreshToken.middleware";
import { PongModule } from "./pong/pong.module";
import { WaitingRoomModule } from "./waitingroom/waitingroom.module";
import { UserModule } from "./auth/user/user.module";
import { MatchhistoryModule } from "./matchhistory/matchhistory.module";
import { AvatarModule } from "./auth/user/avatar.module";
import { LoggerMiddleware } from "./auth/middlewares/logger.middlewares";

@Module({
  imports: [
    AuthModule,
    UserModule,
    AvatarModule,
    PrismaModule,
    ConfigModule.forRoot(),
    ChatModule,
    PongModule,
    WaitingRoomModule,
    MatchhistoryModule,
  ],
  providers: [AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RefreshTokenMiddleware)
      .exclude(
        "/auth/local/signin",
        "/auth/local/signup",
        "/auth/local/signinExtern",
        "/auth/local/handleCallback",
        "/avatar/data/:id"
      )
      .forRoutes("*");
    consumer
      .apply(AuthMiddleware)
      .exclude(
        "/auth/local/signin",
        "/auth/local/signup",
        "/auth/local/signinExtern",
        "/auth/local/handleCallback",
        "/avatar/data/:id"
      )
      .forRoutes("*");

    // Middleware for logging requests and responses (xavier)
    // consumer
    //   .apply(LoggerMiddleware)
    //   .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
