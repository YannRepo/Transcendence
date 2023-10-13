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
exports.WaitingRoomGateway = exports.ClientLight = exports.Client = void 0;
const websockets_1 = require("@nestjs/websockets");
const prisma_service_1 = require("../prisma/prisma.service");
const auth_service_1 = require("../auth/auth.service");
class Client {
    constructor(id, username, socket) {
        this.id = id;
        this.username = username;
        this.socket = socket;
        this.isReady = false;
        this.hardModeSelected = false;
    }
}
exports.Client = Client;
class ClientLight {
    constructor(client) {
        this.id = client.id;
        this.username = client.username;
        this.isReady = client.isReady;
        this.hardModeSelected = client.hardModeSelected;
    }
}
exports.ClientLight = ClientLight;
let WaitingRoomGateway = exports.WaitingRoomGateway = class WaitingRoomGateway {
    constructor(auth) {
        this.auth = auth;
        this.connectedClients = {};
        this.prisma = new prisma_service_1.PrismaService();
    }
    onModuleInit() {
        setInterval(() => {
            this.updateWaitingroom();
        }, 800);
    }
    afterInit() {
    }
    updateWaitingroom() {
        for (const key in this.connectedClients) {
            this.connectedClients[key].socket.emit('updateWaitingRoomState', this.buildLightWaitingRoomState());
        }
    }
    numberOfReadyClients() {
        let readyPlayer = 0;
        for (const key in this.connectedClients) {
            const player = this.connectedClients[key];
            if (player.isReady) {
                readyPlayer++;
            }
        }
        return (readyPlayer);
    }
    buildLightWaitingRoomState() {
        let connectedClientsState = {};
        for (const key in this.connectedClients) {
            const player = this.connectedClients[key];
            connectedClientsState[key] = new ClientLight(player);
        }
        return (connectedClientsState);
    }
    generateName(prefix) {
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const name = `${prefix}_${year}${month}${day}_${hours}${minutes}${seconds}`;
        return (name);
    }
    isSocketFromWaitingroom(client) {
        try {
            if (client.handshake.auth.socketType === 'waitingroom')
                return true;
            return false;
        }
        catch (error) {
            return false;
        }
    }
    getConnectedClientFromSocket(socket) {
        for (const key in this.connectedClients) {
            if (this.connectedClients[key].socket === socket) {
                return (this.connectedClients[key]);
            }
        }
        return (null);
    }
    async clientIsInAGame(socket) {
        const user = await this.auth.getMe(socket.handshake.auth.token);
        let checkIdPlayer1 = await this.prisma.runningames.findFirst({
            where: {
                idPlayer1: user.id
            }
        });
        let checkIdPlayer2 = await this.prisma.runningames.findFirst({
            where: {
                idPlayer2: user.id
            }
        });
        if (checkIdPlayer1 || checkIdPlayer2) {
            return true;
        }
        else {
            return false;
        }
    }
    async handleConnection(socketNewClient, ...args) {
        if (!this.isSocketFromWaitingroom(socketNewClient)) {
            return;
        }
        const user = await this.auth.getMe(socketNewClient.handshake.auth.token);
        if (!user) {
            socketNewClient.disconnect();
            return;
        }
        else {
            if (!this.connectedClients[user.id]) {
                let newClient = new Client(user.id, user.username, socketNewClient);
                this.connectedClients[user.id] = newClient;
            }
            else {
                if (this.connectedClients[user.id].socket) {
                    this.connectedClients[user.id].socket.emit("disconnectedBecauseDoubleSocket");
                    this.connectedClients[user.id].socket = socketNewClient;
                }
            }
            this.connectedClients[user.id].socket.emit("ReadyStatus", this.connectedClients[user.id].isReady);
        }
    }
    async handleDisconnect(disconnectedSocket) {
        for (const key in this.connectedClients) {
            const player = this.connectedClients[key];
            if (player.socket === disconnectedSocket) {
                delete this.connectedClients[key];
            }
        }
    }
    async waitingRoomPlayerReady(socket) {
        if (!this.isSocketFromWaitingroom(socket)) {
            return;
        }
        if (this.getConnectedClientFromSocket(socket)) {
            if (await this.clientIsInAGame(socket)) {
                return;
            }
            let client = this.getConnectedClientFromSocket(socket);
            client.isReady = !client.isReady;
            socket.emit("ReadyStatus", client.isReady);
        }
        let idPlayer1Ready;
        let idPlayer2Ready;
        for (const key in this.connectedClients) {
            const player = this.connectedClients[key];
            if (player.isReady) {
                if (idPlayer1Ready) {
                    idPlayer2Ready = player.id;
                }
                else {
                    idPlayer1Ready = player.id;
                }
            }
        }
        if (this.numberOfReadyClients() >= 2) {
            await this.prisma.runningames.create({
                data: {
                    name: this.generateName("game"),
                    idPlayer1: idPlayer1Ready,
                    idPlayer2: idPlayer2Ready,
                    isReadInPongModule: false,
                    hardMode: (this.connectedClients[idPlayer1Ready].hardModeSelected && this.connectedClients[idPlayer2Ready].hardModeSelected),
                },
            });
            this.connectedClients[idPlayer1Ready].socket.emit('startGame', "gameid");
            this.connectedClients[idPlayer2Ready].socket.emit('startGame', "gameid");
            delete this.connectedClients[idPlayer1Ready];
            delete this.connectedClients[idPlayer2Ready];
        }
    }
    async waitingRoomChangeMode(socket) {
        if (!this.isSocketFromWaitingroom(socket)) {
            return;
        }
        let client = this.getConnectedClientFromSocket(socket);
        if (client) {
            client.hardModeSelected = !client.hardModeSelected;
            socket.emit("modeStatus", client.hardModeSelected);
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Object)
], WaitingRoomGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('playerReady'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WaitingRoomGateway.prototype, "waitingRoomPlayerReady", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('changeMode'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WaitingRoomGateway.prototype, "waitingRoomChangeMode", null);
exports.WaitingRoomGateway = WaitingRoomGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "*",
        }
    }),
    (0, websockets_1.WebSocketGateway)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], WaitingRoomGateway);
//# sourceMappingURL=waitingroom.gateway.js.map