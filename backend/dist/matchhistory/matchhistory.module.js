"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchhistoryModule = void 0;
const common_1 = require("@nestjs/common");
const matchhistory_controller_1 = require("./matchhistory.controller");
const matchhistory_service_1 = require("./matchhistory.service");
const auth_service_1 = require("../auth/auth.service");
const jwt_1 = require("@nestjs/jwt");
const strategies_1 = require("../auth/strategies");
let MatchhistoryModule = exports.MatchhistoryModule = class MatchhistoryModule {
};
exports.MatchhistoryModule = MatchhistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [matchhistory_controller_1.MatchHistoryController],
        providers: [matchhistory_service_1.MatchHistoryService, auth_service_1.AuthService, jwt_1.JwtService, strategies_1.AtStrategy]
    })
], MatchhistoryModule);
//# sourceMappingURL=matchhistory.module.js.map