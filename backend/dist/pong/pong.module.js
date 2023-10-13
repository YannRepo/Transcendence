"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PongModule = void 0;
const common_1 = require("@nestjs/common");
const pong_gateway_1 = require("./pong.gateway");
const jwt_1 = require("@nestjs/jwt");
const strategies_1 = require("../auth/strategies");
const auth_service_1 = require("../auth/auth.service");
let PongModule = exports.PongModule = class PongModule {
};
exports.PongModule = PongModule = __decorate([
    (0, common_1.Module)({
        providers: [pong_gateway_1.PongGateway, auth_service_1.AuthService, jwt_1.JwtService, strategies_1.AtStrategy],
    })
], PongModule);
//# sourceMappingURL=pong.module.js.map