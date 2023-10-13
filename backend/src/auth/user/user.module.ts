import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthService } from "../auth.service";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RefreshTokenMiddleware } from "../middlewares/refreshToken.middleware";
import { AtStrategy, RtStrategy } from "../strategies";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { AvatarModule } from "./avatar.module";
import { AvatarService } from "./avatar.service";

@Module({
  imports: [JwtModule.register({}), UserModule, AvatarModule],
  controllers: [UserController],

  providers: [
    UserService,
    AvatarService,
    AuthService,
    AtStrategy,
    RtStrategy,
    AuthMiddleware,
    RefreshTokenMiddleware,
    JwtService,
  ],

  exports: [AtStrategy, RtStrategy, JwtService],
})
export class UserModule {}
