import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthService } from "../auth.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RefreshTokenMiddleware } from "../middlewares/refreshToken.middleware";
import { AtStrategy, RtStrategy } from "../strategies";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AvatarController } from "./avatar.controller";
import { AvatarService } from "./avatar.service";
import { PongModule } from "src/pong/pong.module";

@Module({
  imports: [JwtModule.register({}), AvatarModule, PongModule],
  controllers: [UserController, AvatarController],

  providers: [
    AvatarService,
    UserService,
    AuthService,
    AtStrategy,
    RtStrategy,
    AuthMiddleware,
    RefreshTokenMiddleware,
    JwtService,
  ],

  exports: [AtStrategy, RtStrategy, JwtService],
})
export class AvatarModule {}
