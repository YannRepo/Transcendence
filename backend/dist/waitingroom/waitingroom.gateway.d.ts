import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from "src/auth/auth.service";
export declare class Client {
    id: number;
    username: string;
    socket: Socket;
    isReady: boolean;
    hardModeSelected: boolean;
    constructor(id: number, username: string, socket: Socket);
}
export declare class ClientLight {
    id: number;
    username: string;
    isReady: boolean;
    hardModeSelected: boolean;
    constructor(client: Client);
}
export declare class WaitingRoomGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private auth;
    server: any;
    prisma: PrismaService;
    connectedClients: {};
    constructor(auth: AuthService);
    onModuleInit(): void;
    afterInit(): void;
    updateWaitingroom(): void;
    numberOfReadyClients(): number;
    buildLightWaitingRoomState(): {};
    generateName(prefix: string): string;
    isSocketFromWaitingroom(client: Socket): boolean;
    getConnectedClientFromSocket(socket: Socket): any;
    clientIsInAGame(socket: Socket): Promise<boolean>;
    handleConnection(socketNewClient: Socket, ...args: any[]): Promise<void>;
    handleDisconnect(disconnectedSocket: Socket): Promise<void>;
    waitingRoomPlayerReady(socket: any): Promise<void>;
    waitingRoomChangeMode(socket: any): Promise<void>;
}
