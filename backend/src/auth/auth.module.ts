import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthMiddleware } from "./middlewares/auth.middleware";
import { RefreshTokenMiddleware } from "./middlewares/refreshToken.middleware";
import { AtStrategy, RtStrategy } from "./strategies";
import { UserModule } from "./user/user.module";
import { AvatarModule } from "./user/avatar.module";
import { AvatarService } from "./user/avatar.service";

@Module({
  imports: [JwtModule.register({}), UserModule, AvatarModule],
  controllers: [AuthController],

  providers: [
    AuthService,
    AvatarService,
    AtStrategy,
    RtStrategy,
    AuthMiddleware,
    RefreshTokenMiddleware,
    JwtService,
  ],

  exports: [AtStrategy, RtStrategy, JwtService],
})
export class AuthModule {}
