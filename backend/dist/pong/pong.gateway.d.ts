import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from "src/auth/auth.service";
export declare const PLAYGROUND_HEIGHT = 500;
export declare const PLAYGROUND_WIDTH = 700;
export declare const BALL_DIAMETER = 18;
export declare const PADDLE_HEIGHT = 100;
export declare const PADDLE_WIDTH = 15;
export declare const DISTANCE_X_PADDLE_PLAYGROUNDEDGE = 20;
export declare const PADDLE1_X = 20;
export declare const INITIAL_PADDLE1_Y = 250;
export declare const PADDLE2_X: number;
export declare const INITIAL_PADDLE2_Y = 250;
export declare const INITIAL_BALL_X: number;
export declare const INITIAL_BALL_Y: number;
export declare const INITIAL_BALL_DIRECTION = 0;
export declare const PADDLE_SPEED = 4;
export declare const INITIAL_BALL_SPEED = 1.4;
export declare const MAX_BALL_SPEED = 5;
export declare const BALL_SPEED_INCREMENT = 0.2;
export declare const GAME_UPDATE_RATE = 5;
export declare const DELAY_TO_START_GAME = 3000;
export declare const END_SCORE = 5;
export declare const PADDLE_HEIGHT_DECREMENTATIOM = 5;
export declare const PADDLE_MIN_HEIGHT = 40;
export declare class Player {
    id: number;
    username: string;
    socket: Socket;
    isReady: boolean;
    ArrowUpPressed: boolean;
    ArrowDownPressed: boolean;
    constructor();
    setPlayer(id: number, socket: Socket): void;
    setReady(): void;
}
export declare class Playground {
    width: number;
    height: number;
    constructor(width: number, height: number);
}
export declare class Ball {
    x: number;
    y: number;
    diameter: number;
    direction_radian: number;
    speed: number;
    constructor(x: number, y: number, diameter: number, direction_radian: number, speed: number);
}
export declare class Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    constructor(x: number, y: number, height: number, width: number, speed: number);
}
export declare class Score {
    p1: number;
    p2: number;
    constructor(p1?: number, p2?: number);
}
export declare class GameData {
    id: number;
    name: string;
    playground: Playground;
    paddle1: Paddle;
    paddle2: Paddle;
    ball: Ball;
    initialBallSpeed: number;
    maxBallSpeed: number;
    paddleSpeed: number;
    ballSpeedIncrement: number;
    player1: Player;
    player2: Player;
    connectedUsers: number;
    isHardmode: boolean;
    score: Score;
    idWinner: any;
    idLooser: any;
    delayToStartGame: any;
    hasStarted: any;
    isOver: any;
    constructor(player1: Player, player2: Player, isHardMode: boolean);
    everyPlayersAreReady(): boolean;
    gameDataFilter(gameData: GameData): GameDataLight;
    emitGameData(): void;
    emitMessage(message: string): void;
    emitEndOfTheGame(): void;
    checkEndOfTheGame(): void;
    printStateLog(): void;
}
export declare class GameDataLight {
    yPaddle1: number;
    heightPaddle1: number;
    yPaddle2: number;
    heightPaddle2: number;
    xBall: number;
    yBall: number;
    scoreP1: number;
    scoreP2: number;
    isHardMode: boolean;
    usernameP1: string;
    usernameP2: string;
    constructor(yPaddle1?: number, yPaddle2?: number, xBall?: number, yBall?: number, scoreP2?: number, scoreP1?: number, usernameP1?: string, usernameP2?: string);
}
export declare class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private auth;
    server: any;
    prisma: PrismaService;
    private gameList;
    updateGameListIsRunning: boolean;
    updateAllTheGamesIsRunning: boolean;
    constructor(auth: AuthService);
    onModuleInit(): void;
    afterInit(): void;
    updateGameList(): Promise<void>;
    updateAllTheGames(): Promise<void>;
    incrementGame(gameData: GameData): void;
    ballIsInPaddle1Hitbox(gameData: GameData): boolean;
    ballIsInPaddle2Hitbox(gameData: GameData): boolean;
    angleAfterBounce(paddle: Paddle, ball: Ball): any;
    reCenter(angle: any): any;
    stopGame(gameData: GameData): Promise<void>;
    isSocketFromPong(client: Socket): boolean;
    isClientIdInAGame(ClientId: Number): boolean;
    getPlayerFromClientId(ClientId: Number): Player;
    isSocketInAGame(ClientId: Number): boolean;
    getPlayerfromSocket(socket: Socket): Player;
    findPlayerfromSocket(socket: Socket): Player;
    printAllGameStateLog(): void;
    handleConnection(newClient: Socket, ...args: any[]): Promise<void>;
    handleDisconnect(disconnectedSocket: Socket): Promise<void>;
    ArrowUpPressed(socket: any, message: any): Promise<void>;
    ArrowDownPressed(socket: any, message: any): Promise<void>;
    ArrowUpReleased(socket: any, message: any): Promise<void>;
    ArrowDownReleased(socket: any, message: any): Promise<void>;
}
