"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AvatarModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvatarModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("../auth.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const refreshToken_middleware_1 = require("../middlewares/refreshToken.middleware");
const strategies_1 = require("../strategies");
const user_controller_1 = require("./user.controller");
const user_service_1 = require("./user.service");
const avatar_controller_1 = require("./avatar.controller");
const avatar_service_1 = require("./avatar.service");
const pong_module_1 = require("../../pong/pong.module");
let AvatarModule = exports.AvatarModule = AvatarModule_1 = class AvatarModule {
};
exports.AvatarModule = AvatarModule = AvatarModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [jwt_1.JwtModule.register({}), AvatarModule_1, pong_module_1.PongModule],
        controllers: [user_controller_1.UserController, avatar_controller_1.AvatarController],
        providers: [
            avatar_service_1.AvatarService,
            user_service_1.UserService,
            auth_service_1.AuthService,
            strategies_1.AtStrategy,
            strategies_1.RtStrategy,
            auth_middleware_1.AuthMiddleware,
            refreshToken_middleware_1.RefreshTokenMiddleware,
            jwt_1.JwtService,
        ],
        exports: [strategies_1.AtStrategy, strategies_1.RtStrategy, jwt_1.JwtService],
    })
], AvatarModule);
//# sourceMappingURL=avatar.module.js.map