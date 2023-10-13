"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchHistoryController = void 0;
const common_1 = require("@nestjs/common");
const matchhistory_service_1 = require("./matchhistory.service");
const prisma_service_1 = require("../prisma/prisma.service");
let MatchHistoryController = exports.MatchHistoryController = class MatchHistoryController {
    constructor(usersService, prisma) {
        this.usersService = usersService;
        this.prisma = prisma;
    }
    async getMatchHistory() {
        const matchHistory = await this.prisma.gameHistory.findMany();
        return matchHistory;
    }
    async getMatchHistoryOfUserId(userId) {
        try {
            return await this.prisma.gameHistory.findMany({
                where: {
                    OR: [{ idPlayer1: Number(userId) }, { idPlayer2: Number(userId) }],
                },
            });
        }
        catch (error) {
            return error;
        }
    }
};
__decorate([
    (0, common_1.Get)("matchhistory"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MatchHistoryController.prototype, "getMatchHistory", null);
__decorate([
    (0, common_1.Get)("matchHistory/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MatchHistoryController.prototype, "getMatchHistoryOfUserId", null);
exports.MatchHistoryController = MatchHistoryController = __decorate([
    (0, common_1.Controller)("matchhistory"),
    __metadata("design:paramtypes", [matchhistory_service_1.MatchHistoryService,
        prisma_service_1.PrismaService])
], MatchHistoryController);
//# sourceMappingURL=matchhistory.controller.js.map