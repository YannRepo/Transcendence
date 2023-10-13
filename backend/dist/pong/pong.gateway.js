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
exports.PongGateway = exports.GameDataLight = exports.GameData = exports.Score = exports.Paddle = exports.Ball = exports.Playground = exports.Player = exports.PADDLE_MIN_HEIGHT = exports.PADDLE_HEIGHT_DECREMENTATIOM = exports.END_SCORE = exports.DELAY_TO_START_GAME = exports.GAME_UPDATE_RATE = exports.BALL_SPEED_INCREMENT = exports.MAX_BALL_SPEED = exports.INITIAL_BALL_SPEED = exports.PADDLE_SPEED = exports.INITIAL_BALL_DIRECTION = exports.INITIAL_BALL_Y = exports.INITIAL_BALL_X = exports.INITIAL_PADDLE2_Y = exports.PADDLE2_X = exports.INITIAL_PADDLE1_Y = exports.PADDLE1_X = exports.DISTANCE_X_PADDLE_PLAYGROUNDEDGE = exports.PADDLE_WIDTH = exports.PADDLE_HEIGHT = exports.BALL_DIAMETER = exports.PLAYGROUND_WIDTH = exports.PLAYGROUND_HEIGHT = void 0;
const websockets_1 = require("@nestjs/websockets");
const prisma_service_1 = require("../prisma/prisma.service");
const auth_service_1 = require("../auth/auth.service");
exports.PLAYGROUND_HEIGHT = 500;
exports.PLAYGROUND_WIDTH = 700;
exports.BALL_DIAMETER = 18;
exports.PADDLE_HEIGHT = 100;
exports.PADDLE_WIDTH = 15;
exports.DISTANCE_X_PADDLE_PLAYGROUNDEDGE = 20;
exports.PADDLE1_X = exports.DISTANCE_X_PADDLE_PLAYGROUNDEDGE;
exports.INITIAL_PADDLE1_Y = 250;
exports.PADDLE2_X = exports.PLAYGROUND_WIDTH - exports.DISTANCE_X_PADDLE_PLAYGROUNDEDGE;
exports.INITIAL_PADDLE2_Y = 250;
exports.INITIAL_BALL_X = exports.PLAYGROUND_WIDTH / 2;
exports.INITIAL_BALL_Y = exports.PLAYGROUND_HEIGHT / 2;
exports.INITIAL_BALL_DIRECTION = 0;
exports.PADDLE_SPEED = 4;
exports.INITIAL_BALL_SPEED = 1.4;
exports.MAX_BALL_SPEED = 5;
exports.BALL_SPEED_INCREMENT = 0.2;
exports.GAME_UPDATE_RATE = 5;
exports.DELAY_TO_START_GAME = 3000;
exports.END_SCORE = 5;
exports.PADDLE_HEIGHT_DECREMENTATIOM = 5;
exports.PADDLE_MIN_HEIGHT = 40;
class Player {
    constructor() {
        this.isReady = false;
        this.ArrowUpPressed = false;
        this.ArrowDownPressed = false;
    }
    setPlayer(id, socket) {
        this.id = id;
        this.socket = socket;
    }
    setReady() {
        this.isReady = true;
    }
}
exports.Player = Player;
class Playground {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}
exports.Playground = Playground;
class Ball {
    constructor(x, y, diameter, direction_radian, speed) {
        this.x = x;
        this.y = y;
        this.diameter = diameter;
        this.direction_radian = direction_radian;
        this.speed = speed;
    }
}
exports.Ball = Ball;
class Paddle {
    constructor(x, y, height, width, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
}
exports.Paddle = Paddle;
class Score {
    constructor(p1 = 0, p2 = 0) {
        this.p1 = p1;
        this.p2 = p2;
    }
}
exports.Score = Score;
class GameData {
    constructor(player1, player2, isHardMode) {
        this.name = "default_game_name";
        this.id = -1;
        this.playground = new Playground(exports.PLAYGROUND_WIDTH, exports.PLAYGROUND_HEIGHT);
        this.paddle1 = new Paddle(exports.PADDLE1_X, exports.INITIAL_PADDLE1_Y - 30, exports.PADDLE_HEIGHT, exports.PADDLE_WIDTH, exports.PADDLE_SPEED);
        this.paddle2 = new Paddle(exports.PADDLE2_X, exports.INITIAL_PADDLE2_Y + 30, exports.PADDLE_HEIGHT, exports.PADDLE_WIDTH, exports.PADDLE_SPEED);
        this.initialBallSpeed = exports.INITIAL_BALL_SPEED;
        this.maxBallSpeed = exports.MAX_BALL_SPEED;
        this.ballSpeedIncrement = exports.BALL_SPEED_INCREMENT;
        this.ball = new Ball(exports.INITIAL_BALL_X, exports.INITIAL_BALL_Y, exports.BALL_DIAMETER, exports.INITIAL_BALL_DIRECTION, exports.INITIAL_BALL_SPEED);
        this.player1 = player1;
        this.player2 = player2;
        this.connectedUsers = 0;
        this.isHardmode = isHardMode;
        this.score = new Score(0, 0);
        this.idWinner = -1;
        this.idLooser = -1;
        this.delayToStartGame = exports.DELAY_TO_START_GAME;
        this.hasStarted = false;
        this.isOver = false;
        if (isHardMode) {
            this.initialBallSpeed *= 1.5;
            this.ballSpeedIncrement *= 1.2;
            this.maxBallSpeed *= 1.4;
        }
    }
    everyPlayersAreReady() {
        if (this.player1.isReady && this.player2.isReady) {
            return (true);
        }
        return (false);
    }
    gameDataFilter(gameData) {
        let gameDataLight = {
            yPaddle1: gameData.paddle1.y,
            heightPaddle1: gameData.paddle1.height,
            yPaddle2: gameData.paddle2.y,
            heightPaddle2: gameData.paddle2.height,
            xBall: gameData.ball.x,
            yBall: gameData.ball.y,
            scoreP1: gameData.score.p1,
            scoreP2: gameData.score.p2,
            isHardMode: gameData.isHardmode,
            usernameP1: gameData.player1.username,
            usernameP2: gameData.player2.username,
        };
        return (gameDataLight);
    }
    emitGameData() {
        if (this.player1.socket) {
            this.player1.socket.emit('updateGame', this.gameDataFilter(this));
        }
        if (this.player2.socket) {
            this.player2.socket.emit('updateGame', this.gameDataFilter(this));
        }
    }
    emitMessage(message) {
        if (this.player1.socket) {
            this.player1.socket.emit('message', message);
        }
        if (this.player2.socket) {
            this.player2.socket.emit('message', message);
        }
    }
    emitEndOfTheGame() {
        if (this.player1.socket) {
            this.player1.socket.emit('endOfTheGame');
        }
        if (this.player2.socket) {
            this.player2.socket.emit('endOfTheGame');
        }
    }
    checkEndOfTheGame() {
        if (this.score.p1 >= exports.END_SCORE || this.score.p2 >= exports.END_SCORE) {
            if (this.score.p1 >= exports.END_SCORE) {
                this.idWinner = this.player1.id;
                this.idLooser = this.player2.id;
                this.emitMessage(this.player1.username + " win");
            }
            else {
                this.idWinner = this.player2.id;
                this.idLooser = this.player1.id;
                this.emitMessage(this.player2.username + " win");
            }
            this.isOver = true;
        }
        else if (!this.player1.socket) {
            this.score.p1 = 0;
            this.idWinner = this.player2.id;
            this.idLooser = this.player1.id;
            this.emitMessage(this.player1.username + " disconnected - " + this.player2.username + " win");
            this.isOver = true;
        }
        else if (!this.player2.socket) {
            this.score.p2 = 0;
            this.idWinner = this.player1.id;
            this.idLooser = this.player2.id;
            this.emitMessage(this.player2.username + " disconnected - " + this.player1.username + " win");
            this.isOver = true;
        }
    }
    printStateLog() {
        console.log("** Game", this.id, "", this.name, "**");
        console.log("Player", this.player1.id, "ready -", this.player1.isReady);
        console.log("Player", this.player2.id, "ready -", this.player2.isReady);
        console.log("");
    }
}
exports.GameData = GameData;
class GameDataLight {
    constructor(yPaddle1 = 0, yPaddle2 = 0, xBall = 0, yBall = 0, scoreP2 = 0, scoreP1 = 0, usernameP1 = "Player1Name", usernameP2 = "Player2Name") {
        this.yPaddle1 = yPaddle1;
        this.yPaddle2 = yPaddle2;
        this.xBall = xBall;
        this.yBall = yBall;
        this.scoreP1 = scoreP1;
        this.scoreP2 = scoreP2;
        this.usernameP1 = usernameP1;
        this.usernameP2 = usernameP2;
    }
}
exports.GameDataLight = GameDataLight;
let PongGateway = exports.PongGateway = class PongGateway {
    constructor(auth) {
        this.auth = auth;
        this.gameList = new Map();
        this.updateGameListIsRunning = false;
        this.updateAllTheGamesIsRunning = false;
        this.prisma = new prisma_service_1.PrismaService();
    }
    onModuleInit() { }
    afterInit() {
        setInterval(() => { this.updateGameList(); }, 500);
        setInterval(() => { this.updateAllTheGames(); }, exports.GAME_UPDATE_RATE);
    }
    async updateGameList() {
        if (this.updateGameListIsRunning) {
            return;
        }
        this.updateGameListIsRunning = true;
        let firstGameInDB;
        firstGameInDB = await this.prisma.runningames.findFirst({
            where: {
                isReadInPongModule: false
            }
        });
        if (firstGameInDB) {
            let isHardMode = firstGameInDB.hardMode;
            this.gameList.set(firstGameInDB.name, new GameData(new Player, new Player, isHardMode));
            this.gameList.get(firstGameInDB.name).player1.id = firstGameInDB.idPlayer1;
            this.gameList.get(firstGameInDB.name).player2.id = firstGameInDB.idPlayer2;
            this.gameList.get(firstGameInDB.name).id = firstGameInDB.id;
            this.gameList.get(firstGameInDB.name).name = firstGameInDB.name;
            await this.prisma.runningames.update({
                where: { id: firstGameInDB.id },
                data: { isReadInPongModule: true },
            });
        }
        this.updateGameListIsRunning = false;
    }
    async updateAllTheGames() {
        if (this.updateAllTheGamesIsRunning) {
            return;
        }
        this.updateAllTheGamesIsRunning = true;
        for (const [key, game] of this.gameList) {
            if (game.hasStarted) {
                if (game.isOver) {
                    this.stopGame(game);
                    await this.prisma.runningames.delete({ where: { id: game.id } });
                    this.gameList.delete(key);
                    this.updateAllTheGamesIsRunning = false;
                    return;
                }
                else {
                    if (game.delayToStartGame > 0) {
                        let message = "";
                        game.emitMessage("Game will start in - " + Math.ceil(game.delayToStartGame / 1000));
                        game.emitGameData();
                        game.delayToStartGame -= exports.GAME_UPDATE_RATE;
                    }
                    else {
                        game.emitMessage("");
                        this.incrementGame(game);
                        game.emitGameData();
                        game.checkEndOfTheGame();
                    }
                }
            }
            else {
                if (game.everyPlayersAreReady()) {
                    game.hasStarted = true;
                }
                else {
                    game.emitMessage("Waiting for your opponent");
                }
            }
        }
        this.updateAllTheGamesIsRunning = false;
    }
    incrementGame(gameData) {
        gameData.ball.x = gameData.ball.x + Math.cos(gameData.ball.direction_radian) * gameData.ball.speed;
        gameData.ball.y = gameData.ball.y + Math.sin(gameData.ball.direction_radian) * gameData.ball.speed;
        if (gameData.ball.y > gameData.playground.height - gameData.ball.diameter / 2) {
            gameData.ball.direction_radian = this.reCenter(-1 * gameData.ball.direction_radian);
        }
        if (gameData.ball.y < 0 + gameData.ball.diameter / 2) {
            gameData.ball.direction_radian = this.reCenter(-1 * gameData.ball.direction_radian);
        }
        if (this.ballIsInPaddle1Hitbox(gameData)) {
            gameData.ball.direction_radian = this.angleAfterBounce(gameData.paddle1, gameData.ball);
            if (gameData.ball.speed < gameData.maxBallSpeed) {
                gameData.ball.speed = gameData.ball.speed + gameData.ballSpeedIncrement;
            }
            if (gameData.isHardmode && gameData.paddle1.height > exports.PADDLE_MIN_HEIGHT) {
                gameData.paddle1.height -= exports.PADDLE_HEIGHT_DECREMENTATIOM;
            }
        }
        else if (gameData.ball.x < 0) {
            gameData.ball.x = gameData.playground.width / 2;
            gameData.ball.y = gameData.playground.height / 2;
            gameData.ball.direction_radian = Math.PI;
            gameData.ball.speed = gameData.initialBallSpeed;
            gameData.paddle1.height = exports.PADDLE_HEIGHT;
            gameData.paddle1.y = exports.INITIAL_PADDLE1_Y;
            gameData.paddle2.height = exports.PADDLE_HEIGHT;
            gameData.score.p2++;
        }
        if (this.ballIsInPaddle2Hitbox(gameData)) {
            gameData.ball.direction_radian = this.angleAfterBounce(gameData.paddle2, gameData.ball);
            if (gameData.ball.speed < gameData.maxBallSpeed) {
                gameData.ball.speed = gameData.ball.speed + gameData.ballSpeedIncrement;
            }
            if (gameData.isHardmode && gameData.paddle2.height > exports.PADDLE_MIN_HEIGHT) {
                gameData.paddle2.height -= exports.PADDLE_HEIGHT_DECREMENTATIOM;
            }
        }
        else if (gameData.ball.x > gameData.playground.width) {
            gameData.ball.x = gameData.playground.width / 2;
            gameData.ball.y = gameData.playground.height / 2;
            gameData.ball.direction_radian = 0;
            gameData.ball.speed = gameData.initialBallSpeed;
            gameData.paddle1.height = exports.PADDLE_HEIGHT;
            gameData.paddle2.height = exports.PADDLE_HEIGHT;
            gameData.paddle2.y = exports.INITIAL_PADDLE2_Y;
            gameData.score.p1++;
        }
        if (gameData.player1.ArrowUpPressed) {
            gameData.paddle1.y -= gameData.paddle1.speed;
            if (gameData.paddle1.y < 0 + gameData.paddle1.height / 2) {
                gameData.paddle1.y = 0 + gameData.paddle1.height / 2;
            }
        }
        if (gameData.player1.ArrowDownPressed) {
            gameData.paddle1.y += gameData.paddle1.speed;
            if (gameData.paddle1.y > gameData.playground.height - gameData.paddle1.height / 2) {
                gameData.paddle1.y = gameData.playground.height - gameData.paddle1.height / 2;
            }
        }
        if (gameData.player2.ArrowUpPressed) {
            gameData.paddle2.y -= gameData.paddle2.speed;
            if (gameData.paddle2.y < 0 + gameData.paddle2.height / 2) {
                gameData.paddle2.y = 0 + gameData.paddle2.height / 2;
            }
        }
        if (gameData.player2.ArrowDownPressed) {
            gameData.paddle2.y += gameData.paddle2.speed;
            if (gameData.paddle2.y > gameData.playground.height - gameData.paddle2.height / 2) {
                gameData.paddle2.y = gameData.playground.height - gameData.paddle2.height / 2;
            }
        }
    }
    ballIsInPaddle1Hitbox(gameData) {
        if (gameData.ball.x < gameData.paddle1.x + gameData.paddle1.width / 2 + gameData.ball.diameter / 2
            && gameData.ball.x > gameData.paddle1.x
            && gameData.ball.y < 5 + gameData.paddle1.y + gameData.paddle1.height / 2
            && gameData.ball.y > -5 + gameData.paddle1.y - gameData.paddle1.height / 2
            && (gameData.ball.direction_radian > Math.PI / 2 && gameData.ball.direction_radian < 3 * Math.PI / 2)) {
            return (true);
        }
        return (false);
    }
    ballIsInPaddle2Hitbox(gameData) {
        if (gameData.ball.x > gameData.paddle2.x - gameData.paddle2.width / 2 - gameData.ball.diameter / 2
            && gameData.ball.x < gameData.paddle2.x
            && gameData.ball.y < 5 + gameData.paddle2.y + gameData.paddle2.height / 2
            && gameData.ball.y > -5 + gameData.paddle2.y - gameData.paddle2.height / 2
            && (gameData.ball.direction_radian > 3 * Math.PI / 2 || gameData.ball.direction_radian < Math.PI / 2)) {
            return (true);
        }
        return (false);
    }
    angleAfterBounce(paddle, ball) {
        let distanceRatio = (ball.y - paddle.y) / (paddle.height / 2);
        let angle = (60 * Math.PI / 180) * distanceRatio;
        if (ball.direction_radian > 3 * Math.PI / 2 || ball.direction_radian < Math.PI / 2) {
            return (this.reCenter(Math.PI - angle));
        }
        if (ball.direction_radian > Math.PI / 2 && ball.direction_radian < 3 * Math.PI / 2) {
            return (this.reCenter(angle));
        }
    }
    reCenter(angle) {
        if (angle > 2 * Math.PI) {
            return (angle % 2 * Math.PI);
        }
        while (angle < 0) {
            angle = angle + 2 * Math.PI;
        }
        return (angle);
    }
    async stopGame(gameData) {
        gameData.emitEndOfTheGame();
        if (gameData.player1.socket) {
            gameData.player1.socket.disconnect();
        }
        if (gameData.player2.socket) {
            gameData.player2.socket.disconnect();
        }
        await this.prisma.user.update({
            where: {
                id: gameData.player1.id,
            },
            data: {
                inGame: false,
            },
        });
        await this.prisma.user.update({
            where: {
                id: gameData.player2.id,
            },
            data: {
                inGame: false,
            },
        });
        await this.prisma.gameHistory.create({
            data: {
                id: gameData.id,
                idPlayer1: gameData.player1.id,
                idPlayer2: gameData.player2.id,
                scorePlayer1: gameData.score.p1,
                scorePlayer2: gameData.score.p2,
                idWinner: gameData.idWinner,
            },
        });
        let userWinner = await this.prisma.user.findFirst({ where: { id: gameData.idWinner, } });
        await this.prisma.user.update({ where: { id: gameData.idWinner, }, data: { gamesWon: userWinner.gamesWon + 1, }, });
        userWinner = await this.prisma.user.findFirst({ where: { id: gameData.idWinner, } });
        await this.prisma.user.update({ where: { id: gameData.idWinner, }, data: { score: userWinner.gamesWon - userWinner.gamesLost, }, });
        let userLooser = await this.prisma.user.findFirst({ where: { id: gameData.idLooser, } });
        await this.prisma.user.update({ where: { id: gameData.idLooser, }, data: { gamesLost: userLooser.gamesLost + 1, }, });
        userLooser = await this.prisma.user.findFirst({ where: { id: gameData.idLooser, } });
        await this.prisma.user.update({ where: { id: gameData.idLooser, }, data: { score: userLooser.gamesWon - userLooser.gamesLost, }, });
        await this.prisma.user.update({ where: { id: gameData.idWinner, }, data: { achievementPong: true, }, });
    }
    isSocketFromPong(client) {
        try {
            if (client.handshake.auth.socketType === 'pong')
                return true;
            return false;
        }
        catch (error) {
            return false;
        }
    }
    isClientIdInAGame(ClientId) {
        for (const [key, game] of this.gameList) {
            if (game.player1.id === ClientId || game.player2.id === ClientId) {
                return (true);
            }
        }
        return (false);
    }
    getPlayerFromClientId(ClientId) {
        for (const [key, game] of this.gameList) {
            if (game.player1.id === ClientId) {
                return (game.player1);
            }
            if (game.player2.id === ClientId) {
                return (game.player2);
            }
        }
        return (null);
    }
    isSocketInAGame(ClientId) {
        for (const [key, game] of this.gameList) {
            if (game.player1.id === ClientId || game.player2.id === ClientId) {
                return (true);
            }
        }
        return (false);
    }
    getPlayerfromSocket(socket) {
        for (const [key, game] of this.gameList) {
            if (game.player1.socket === socket) {
                return (game.player1);
            }
            if (game.player2.socket === socket) {
                return (game.player2);
            }
        }
        return (null);
    }
    findPlayerfromSocket(socket) {
        for (const [key, game] of this.gameList) {
            if (game.player1.socket === socket) {
                return (game.player1);
            }
            if (game.player2.socket === socket) {
                return (game.player2);
            }
        }
        return (null);
    }
    printAllGameStateLog() {
        for (const [key, game] of this.gameList) {
            game.printStateLog();
        }
    }
    async handleConnection(newClient, ...args) {
        if (!this.isSocketFromPong(newClient)) {
            return;
        }
        this.updateGameList();
        const user = await this.auth.getMe(newClient.handshake.auth.token);
        if (!user) {
            newClient.disconnect();
            return;
        }
        if (this.isClientIdInAGame(user.id)) {
            let player = this.getPlayerFromClientId(user.id);
            if (player.socket) {
                player.socket.emit('disconnected');
                player.socket.disconnect();
            }
            player.socket = newClient;
            player.username = user.username;
            player.setReady();
            await this.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    inGame: true,
                },
            });
        }
        else {
            newClient.emit('disconnected');
            newClient.disconnect();
        }
    }
    async handleDisconnect(disconnectedSocket) {
        let player = this.findPlayerfromSocket(disconnectedSocket);
        if (player) {
            player.socket.disconnect();
            player.socket = null;
        }
    }
    async ArrowUpPressed(socket, message) {
        if (!this.isSocketFromPong(socket)) {
            return;
        }
        let player = this.findPlayerfromSocket(socket);
        if (player) {
            player.ArrowUpPressed = true;
        }
    }
    async ArrowDownPressed(socket, message) {
        if (!this.isSocketFromPong(socket)) {
            return;
        }
        let player = this.findPlayerfromSocket(socket);
        if (player) {
            player.ArrowDownPressed = true;
        }
    }
    async ArrowUpReleased(socket, message) {
        if (!this.isSocketFromPong(socket)) {
            return;
        }
        let player = this.findPlayerfromSocket(socket);
        if (player) {
            player.ArrowUpPressed = false;
        }
    }
    async ArrowDownReleased(socket, message) {
        if (!this.isSocketFromPong(socket)) {
            return;
        }
        let player = this.findPlayerfromSocket(socket);
        if (player) {
            player.ArrowDownPressed = false;
        }
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", Object)
], PongGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ArrowUpPressed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "ArrowUpPressed", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ArrowDownPressed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "ArrowDownPressed", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ArrowUpReleased'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "ArrowUpReleased", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ArrowDownReleased'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "ArrowDownReleased", null);
exports.PongGateway = PongGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: "*",
        }
    }),
    (0, websockets_1.WebSocketGateway)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], PongGateway);
//# sourceMappingURL=pong.gateway.js.map