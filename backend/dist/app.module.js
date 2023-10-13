"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const auth_middleware_1 = require("./auth/middlewares/auth.middleware");
const prisma_module_1 = require("./prisma/prisma.module");
const config_1 = require("@nestjs/config");
const chat_module_1 = require("./chat/chat.module");
const auth_service_1 = require("./auth/auth.service");
const refreshToken_middleware_1 = require("./auth/middlewares/refreshToken.middleware");
const pong_module_1 = require("./pong/pong.module");
const waitingroom_module_1 = require("./waitingroom/waitingroom.module");
const user_module_1 = require("./auth/user/user.module");
const matchhistory_module_1 = require("./matchhistory/matchhistory.module");
const avatar_module_1 = require("./auth/user/avatar.module");
let AppModule = exports.AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(refreshToken_middleware_1.RefreshTokenMiddleware)
            .exclude("/auth/local/signin", "/auth/local/signup", "/auth/local/signinExtern", "/auth/local/handleCallback", "/avatar/data/:id")
            .forRoutes("*");
        consumer
            .apply(auth_middleware_1.AuthMiddleware)
            .exclude("/auth/local/signin", "/auth/local/signup", "/auth/local/signinExtern", "/auth/local/handleCallback", "/avatar/data/:id")
            .forRoutes("*");
    }
};
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            avatar_module_1.AvatarModule,
            prisma_module_1.PrismaModule,
            config_1.ConfigModule.forRoot(),
            chat_module_1.ChatModule,
            pong_module_1.PongModule,
            waitingroom_module_1.WaitingRoomModule,
            matchhistory_module_1.MatchhistoryModule,
        ],
        providers: [auth_service_1.AuthService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map