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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaitingRoomService = exports.Client = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
class Client {
    constructor(id) {
        this.ready = false;
        this.id = id;
    }
}
exports.Client = Client;
let WaitingRoomService = exports.WaitingRoomService = class WaitingRoomService {
    constructor(prisma) {
        this.prisma = prisma;
        this.connectedCient = new Map();
        this.connectedClient = [];
    }
    onModuleInit() {
        setInterval(() => {
            this.updateWaitingroom();
        }, 200);
    }
    async createGame(data) {
        this.connectedClient.push(1);
    }
    updateWaitingroom() {
    }
};
exports.WaitingRoomService = WaitingRoomService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WaitingRoomService);
//# sourceMappingURL=waitingroom.service.js.map