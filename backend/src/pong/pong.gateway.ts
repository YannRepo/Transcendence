import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	} from '@nestjs/websockets';
	import { Server, Socket } from 'socket.io';
	import { Injectable } from '@nestjs/common';
    import { PrismaService } from 'src/prisma/prisma.service';
	import { AuthService } from "src/auth/auth.service";


// ###############################################################################################################
// ##############################################  GAME DATA (CONSTANT)  #########################################
// ##############################################################
	// -----> (x)################################
	// -----> (x)
	// |
	// |
	// v (y)
	//
	// These data are identical to the frontend. Don't change it without change the frontend
	// Dimensions
	export const PLAYGROUND_HEIGHT = 500;
	export const PLAYGROUND_WIDTH = 700;
	export const BALL_DIAMETER = 18;
	export const PADDLE_HEIGHT = 100;
	export const PADDLE_WIDTH = 15;
	export const DISTANCE_X_PADDLE_PLAYGROUNDEDGE = 20;

	// Initial positions
	export const PADDLE1_X = DISTANCE_X_PADDLE_PLAYGROUNDEDGE;
	export const INITIAL_PADDLE1_Y = 250;
	export const PADDLE2_X = PLAYGROUND_WIDTH - DISTANCE_X_PADDLE_PLAYGROUNDEDGE;
	export const INITIAL_PADDLE2_Y = 250;
	export const INITIAL_BALL_X = PLAYGROUND_WIDTH/ 2;
	export const INITIAL_BALL_Y = PLAYGROUND_HEIGHT / 2;
	export const INITIAL_BALL_DIRECTION = 0; // (radian) 0 = right 3.14 = left

	// Game data
	export const PADDLE_SPEED = 4;
	export const INITIAL_BALL_SPEED = 1.4;
	export const MAX_BALL_SPEED = 5;
	export const BALL_SPEED_INCREMENT = 0.2;
	export const GAME_UPDATE_RATE = 5; // ms, time between each game update (5 default value)
	export const DELAY_TO_START_GAME = 3000; // Real time will also depend of game update rate (4000 default value)
	export const END_SCORE = 5;

	// Hard Mode
	export const PADDLE_HEIGHT_DECREMENTATIOM = 5;
	export const PADDLE_MIN_HEIGHT = 40;

// ###############################################################################################################
// ###################################################  CLASS  ###################################################
// ###############################################################################################################
	export class Player {
		id: number;
		username: string;
		socket: Socket;
		isReady: boolean;
		ArrowUpPressed: boolean;
		ArrowDownPressed: boolean;
		
		constructor()
		{
			this.isReady = false;
			this.ArrowUpPressed = false;
			this.ArrowDownPressed = false;
		}

		setPlayer(id: number, socket: Socket)
		{
			this.id = id;
			this.socket = socket;
		}

		setReady()
		{
			this.isReady = true;
		}
	}

	export class Playground
	{
		width: number;
		height: number;
		constructor (width:number, height:number)
		{
			this.width = width;
			this.height = height;
		}
	}

	export class Ball
	{
		x: number;
		y: number;
		diameter: number;
		direction_radian: number;
		speed: number;
		constructor (x: number, y: number, diameter: number, direction_radian: number, speed: number)
		{
			this.x = x;
			this.y = y;
			this.diameter = diameter;
			this.direction_radian = direction_radian;
			this.speed = speed;
		}
	}

	export class Paddle
	{
		x: number;
		y: number;
		width: number;
		height: number;
		speed: number;
		constructor (x:number, y:number, height: number, width: number, speed: number)
		{
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.speed = speed;
		}
	}

	export class Score
	{
		p1: number
		p2: number
		constructor (p1 = 0, p2 = 0)
		{
			this.p1 = p1;
			this.p2 = p2;
		}
	}

	export class GameData
	{
		id: number;
		name: string
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
		idWinner;
		idLooser;
		delayToStartGame;
		hasStarted;
		isOver;

		constructor (player1: Player, player2: Player, isHardMode: boolean)
		{
			this.name = "default_game_name";
			this.id = -1;

			// arguments (width, height)
			this.playground = new Playground(PLAYGROUND_WIDTH,PLAYGROUND_HEIGHT);

			// arguments x, y, height, width, speed)
			this.paddle1 = new Paddle(PADDLE1_X, INITIAL_PADDLE1_Y - 30, PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_SPEED);

			// arguments x, y, height, width, speed)
			this.paddle2 = new Paddle(PADDLE2_X, INITIAL_PADDLE2_Y + 30, PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_SPEED);

			// TBD remplacer ces 2 attrributs par les constantes
			this.initialBallSpeed = INITIAL_BALL_SPEED;
			this.maxBallSpeed = MAX_BALL_SPEED;
			this.ballSpeedIncrement = BALL_SPEED_INCREMENT;
			// arguments x, y, diameter, direction_radian, speed)
			this.ball = new Ball(INITIAL_BALL_X, INITIAL_BALL_Y, BALL_DIAMETER, INITIAL_BALL_DIRECTION, INITIAL_BALL_SPEED);

			this.player1 = player1;
			this.player2 = player2;

			this.connectedUsers = 0;

			this.isHardmode = isHardMode;

			this.score = new Score(0, 0);
			this.idWinner = -1;
			this.idLooser = -1;

			this.delayToStartGame = DELAY_TO_START_GAME;
			this.hasStarted = false;
			this.isOver = false;

			if (isHardMode)
			{
				this.initialBallSpeed *= 1.5;
				this.ballSpeedIncrement *= 1.2;
				this.maxBallSpeed *= 1.4;

			}

		}

		everyPlayersAreReady()
		{
			if (this.player1.isReady && this.player2.isReady)
			{
				return (true);
			}
			return (false);
		}



		gameDataFilter(gameData: GameData)
		{
			let gameDataLight: GameDataLight = {
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

		emitGameData()
		{
			if(this.player1.socket)
			{
				this.player1.socket.emit('updateGame', this.gameDataFilter(this));
			}
			if(this.player2.socket)
			{
				this.player2.socket.emit('updateGame', this.gameDataFilter(this));
			}
		}

		emitMessage(message: string)
		{
			if (this.player1.socket)
			{
				this.player1.socket.emit('message', message);
			}
			if (this.player2.socket)
			{
				this.player2.socket.emit('message', message);
			}
		}

		emitEndOfTheGame()
		{
			if (this.player1.socket)
			{
				this.player1.socket.emit('endOfTheGame');
			}
			if (this.player2.socket)
			{
				this.player2.socket.emit('endOfTheGame');
			}
		}

		checkEndOfTheGame()
		{
			// if a player win
			if (this.score.p1 >= END_SCORE || this.score.p2 >= END_SCORE)
			{
				if (this.score.p1 >= END_SCORE)
				{
					this.idWinner = this.player1.id;
					this.idLooser = this.player2.id;
					this.emitMessage(this.player1.username + " win");
				}
				else
				{
					this.idWinner = this.player2.id;
					this.idLooser = this.player1.id;
					this.emitMessage(this.player2.username + " win");
				}
				this.isOver = true;
			}
			//if a player is disconnected
			else if (!this.player1.socket)
			{
				this.score.p1 = 0;
				this.idWinner = this.player2.id;
				this.idLooser = this.player1.id;
				this.emitMessage(this.player1.username + " disconnected - " + this.player2.username + " win");
				this.isOver = true;
			}
			else if (!this.player2.socket)
			{
				this.score.p2 = 0;
				this.idWinner = this.player1.id;
				this.idLooser = this.player2.id;
				this.emitMessage(this.player2.username + " disconnected - " + this.player1.username + " win");
				this.isOver = true;
			}

		}

		printStateLog()
		{
			console.log("** Game", this.id, "", this.name, "**");
			console.log("Player", this.player1.id, "ready -", this.player1.isReady);
			console.log("Player", this.player2.id, "ready -", this.player2.isReady);
			console.log("");
		}
	}

	export class GameDataLight
	{
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

		constructor (yPaddle1=0, yPaddle2=0, xBall=0, yBall=0, scoreP2=0, scoreP1=0, usernameP1="Player1Name", usernameP2="Player2Name" )
		{
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


// ###############################################################################################################
// ###################################################  CORS  ###################################################
// ###############################################################################################################
	@WebSocketGateway({
	cors: {
		origin: "*", // specify the domain of your svelte app here
//	  methods: ["GET", "POST"],
//	  allowedHeaders: ["my-custom-header"],
//	  credentials: true
	}
	})

// ###############################################################################################################
// ###################################################  GAME  ###################################################
// ###############################################################################################################
	@WebSocketGateway()
	export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect 
	{	
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------  Initialisation  ------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
		@WebSocketServer() server;
		prisma: PrismaService;

		//player1Tmp: Player = new Player;
		//player2Tmp: Player = new Player;
		
		//private gameData:GameData = new GameData(this.player1Tmp, this.player2Tmp)
		
		private gameList: Map<string, GameData> = new Map();
		updateGameListIsRunning: boolean = false;
		updateAllTheGamesIsRunning: boolean = false;

		constructor(private auth: AuthService)
		{
			this.prisma = new PrismaService();
		}

		onModuleInit(){}
		
		afterInit()
		{
			// update the list of game, reading the database
			setInterval(() => {this.updateGameList();}, 500); // loop toutes les X ms
			// update the running games (ball move, paddle...)
			// TBD peut etre faculatif car update faite a chaque nouvelle connection
			setInterval(() => {this.updateAllTheGames();}, GAME_UPDATE_RATE);
			// console log for debug
			//setInterval(() => {this.printAllGameStateLog();}, 2000); // loop toutes les X ms
		}

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------  Functions game update ------------------------------------
// ---------------------------------------------------------------------------------------------------------------
		async updateGameList()
		{
			// - read the database to see if a game has been created by the waitingroom
			// - update the gameList when a match is found
			// - delete the match in the database

			// updateGameListIsRunning avoids overlap and multiaccess
			// to db if access takes too long
			if (this.updateGameListIsRunning)
			{
				return;
			}
		
			this.updateGameListIsRunning = true;
			let firstGameInDB;
			firstGameInDB = await this.prisma.runningames.findFirst({
				where: {
					isReadInPongModule: false
				}
			  });
			if (firstGameInDB)
			{
				let isHardMode = firstGameInDB.hardMode;
				//console.log("read db:", firstGameInDB.name, firstGameInDB.id);
				this.gameList.set(firstGameInDB.name, new GameData(new Player, new Player, isHardMode))
				this.gameList.get(firstGameInDB.name).player1.id = firstGameInDB.idPlayer1;
				this.gameList.get(firstGameInDB.name).player2.id = firstGameInDB.idPlayer2;
				this.gameList.get(firstGameInDB.name).id = firstGameInDB.id;
				this.gameList.get(firstGameInDB.name).name = firstGameInDB.name;
				//this.gameList.get(firstGameInDB.name).isHardmode = firstGameInDB.hardMode;
				//await this.prisma.runningames.delete({where: { id: firstGameInDB.id }})
				await this.prisma.runningames.update({
					where: { id: firstGameInDB.id },
					data: { isReadInPongModule: true },
				  });
			}
			this.updateGameListIsRunning = false;
		}

		async updateAllTheGames()
		{
			if (this.updateAllTheGamesIsRunning)
			{
				return;
			}
			this.updateAllTheGamesIsRunning = true;

			for (const [key, game] of this.gameList)
			{	
				if (game.hasStarted)
				{
					if (game.isOver) 
					{
						this.stopGame(game);
						await this.prisma.runningames.delete({where: { id: game.id }})
						this.gameList.delete(key);


						this.updateAllTheGamesIsRunning = false;
						return; // return to avoid error in for loop (maybe not necessary TBD) 
					}
					else
					{
						if (game.delayToStartGame > 0)
						{
							let message = "";
							game.emitMessage("Game will start in - " + Math.ceil(game.delayToStartGame/1000));
							game.emitGameData();
							game.delayToStartGame -= GAME_UPDATE_RATE;
						}
						else
						{
							game.emitMessage("");
							this.incrementGame(game); // TBD passer increment game in gamedata class
							game.emitGameData();
							game.checkEndOfTheGame();
						}
					}
				}
				else
				{
					if(game.everyPlayersAreReady())
					{
						game.hasStarted = true;

					}
					else
					{
						game.emitMessage("Waiting for your opponent")
					}
				}
				
			}
			this.updateAllTheGamesIsRunning = false;
		}

		incrementGame(gameData: GameData)
		{
			// move ball
				// Displacement
				gameData.ball.x = gameData.ball.x + Math.cos(gameData.ball.direction_radian) * gameData.ball.speed;
				gameData.ball.y = gameData.ball.y + Math.sin(gameData.ball.direction_radian) * gameData.ball.speed;

				// top/down bounce
				if (gameData.ball.y > gameData.playground.height - gameData.ball.diameter / 2)
				{
					gameData.ball.direction_radian = this.reCenter(-1 * gameData.ball.direction_radian);
				}
				if (gameData.ball.y < 0 + gameData.ball.diameter / 2)
				{
					gameData.ball.direction_radian = this.reCenter(-1 * gameData.ball.direction_radian);
				}

				// paddle 1 bounce and death zone
				if (this.ballIsInPaddle1Hitbox(gameData))
				{
					gameData.ball.direction_radian = this.angleAfterBounce(gameData.paddle1, gameData.ball);
					if(gameData.ball.speed < gameData.maxBallSpeed)
					{
						gameData.ball.speed = gameData.ball.speed + gameData.ballSpeedIncrement;
					}
					if (gameData.isHardmode && gameData.paddle1.height > PADDLE_MIN_HEIGHT)
					{
						gameData.paddle1.height -= PADDLE_HEIGHT_DECREMENTATIOM;
					}
				}
				else if (gameData.ball.x < 0)
				{
					gameData.ball.x = gameData.playground.width / 2;
					gameData.ball.y = gameData.playground.height / 2;
					gameData.ball.direction_radian = Math.PI;
					gameData.ball.speed = gameData.initialBallSpeed;
					gameData.paddle1.height = PADDLE_HEIGHT;
					gameData.paddle1.y = INITIAL_PADDLE1_Y;
					gameData.paddle2.height = PADDLE_HEIGHT;
					//gameData.paddle2.y = INITIAL_PADDLE2_Y;
					gameData.score.p2 ++;
				}
				// paddle 2 bounce and death zone
				if (this.ballIsInPaddle2Hitbox(gameData))
				{
					gameData.ball.direction_radian = this.angleAfterBounce(gameData.paddle2, gameData.ball);
					if(gameData.ball.speed < gameData.maxBallSpeed)
					{
						gameData.ball.speed = gameData.ball.speed + gameData.ballSpeedIncrement;
					}
					if (gameData.isHardmode && gameData.paddle2.height > PADDLE_MIN_HEIGHT)
					{
						gameData.paddle2.height -= PADDLE_HEIGHT_DECREMENTATIOM;
					}
				}
				else if (gameData.ball.x > gameData.playground.width)
				{
					gameData.ball.x = gameData.playground.width / 2;
					gameData.ball.y = gameData.playground.height / 2;
					gameData.ball.direction_radian = 0;
					gameData.ball.speed = gameData.initialBallSpeed;
					gameData.paddle1.height = PADDLE_HEIGHT;
					//gameData.paddle1.y = INITIAL_PADDLE1_Y;
					gameData.paddle2.height = PADDLE_HEIGHT;
					gameData.paddle2.y = INITIAL_PADDLE2_Y;
					gameData.score.p1 ++;
				}

			// move paddle1
			if (gameData.player1.ArrowUpPressed)
			{
				gameData.paddle1.y -= gameData.paddle1.speed;
				if (gameData.paddle1.y < 0 + gameData.paddle1.height / 2)
				{
					gameData.paddle1.y = 0 + gameData.paddle1.height / 2;
				}

			}
			if (gameData.player1.ArrowDownPressed)
			{
				gameData.paddle1.y += gameData.paddle1.speed;
				if (gameData.paddle1.y > gameData.playground.height - gameData.paddle1.height / 2)
				{
					gameData.paddle1.y = gameData.playground.height - gameData.paddle1.height / 2;
				}
			}
			// move paddle2
			if (gameData.player2.ArrowUpPressed)
			{
				gameData.paddle2.y -= gameData.paddle2.speed;
				if (gameData.paddle2.y < 0 + gameData.paddle2.height / 2)
				{
					gameData.paddle2.y = 0 + gameData.paddle2.height / 2;
				}
			}
			if (gameData.player2.ArrowDownPressed)
			{
				gameData.paddle2.y += gameData.paddle2.speed;
				if (gameData.paddle2.y > gameData.playground.height - gameData.paddle2.height / 2)
				{
					gameData.paddle2.y = gameData.playground.height - gameData.paddle2.height / 2;
				}
			}
		}

		ballIsInPaddle1Hitbox(gameData: GameData)
		{
			if (gameData.ball.x < gameData.paddle1.x + gameData.paddle1.width/ 2 + gameData.ball.diameter / 2 // right side of the hitbox
				&& gameData.ball.x > gameData.paddle1.x // left side of the hitbox
				&& gameData.ball.y < 5 + gameData.paddle1.y + gameData.paddle1.height / 2 // top side of the hitbox, +5 to have a box a little bit bigger than the paddle
				&& gameData.ball.y > -5 + gameData.paddle1.y - gameData.paddle1.height / 2 // bottom side of the hitbox, +5 to have a box a little bit bigger than the paddle
				&& (gameData.ball.direction_radian > Math.PI / 2 && gameData.ball.direction_radian < 3 * Math.PI / 2) // check the direction of the ball to avoid lock in the hitbox when vertical speed
				)
			{
				return (true);
			}
			return (false);
		}

		ballIsInPaddle2Hitbox(gameData: GameData)
		{
			if (gameData.ball.x > gameData.paddle2.x - gameData.paddle2.width/ 2 - gameData.ball.diameter / 2 // left side of the hitbox
				&& gameData.ball.x < gameData.paddle2.x // right side of the hitbox
				&& gameData.ball.y < 5 + gameData.paddle2.y + gameData.paddle2.height / 2 // top side of the hitbox, +5 to have a box a little bit bigger than the paddle
				&& gameData.ball.y > -5 + gameData.paddle2.y - gameData.paddle2.height / 2 // bottom side of the hitbox, +5 to have a box a little bit bigger than the paddle
				&& (gameData.ball.direction_radian > 3 * Math.PI / 2 || gameData.ball.direction_radian < Math.PI / 2) // check the direction of the ball to avoid lock in the hitbox when vertical speed
				)
			{
				return (true);
			}
			return (false);
		}

		angleAfterBounce(paddle: Paddle, ball: Ball)
		{
			let distanceRatio: number = (ball.y - paddle.y) / (paddle.height / 2) 
			let angle: number = (60 * Math.PI / 180) * distanceRatio;
			// if ball moving to the right direction
			if(ball.direction_radian > 3 * Math.PI / 2 || ball.direction_radian < Math.PI / 2) // check the direction of the ball to avoid lock in the hitbox when vertical speed
			{
				return (this.reCenter(Math.PI - angle));
			}
			
			if(ball.direction_radian > Math.PI / 2 && ball.direction_radian < 3 * Math.PI / 2) // check the direction of the ball to avoid lock in the hitbox when vertical speed
			// if ball moving to the left direction
			{
				return (this.reCenter(angle));
			}
		}

		// take an angle and return it between 0 and 2pi radian (equivalent to 0-360 degres)
		reCenter(angle)
		{
			if (angle > 2 * Math.PI)
			{
				return (angle % 2 * Math.PI);
			}
			while (angle < 0)
			{
				angle = angle + 2 * Math.PI;
			}
			return (angle);
		}

		async stopGame(gameData: GameData)
		{
			gameData.emitEndOfTheGame();
			if (gameData.player1.socket)
			{
				gameData.player1.socket.disconnect();
			}
			if (gameData.player2.socket)
			{
				gameData.player2.socket.disconnect();
			}
			// update player status in User table
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

			// update gameHistory table
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

			// update gamesWon, gamesLost, score
			let userWinner = await this.prisma.user.findFirst({where: {id: gameData.idWinner,}});
			await this.prisma.user.update({where: {id: gameData.idWinner,}, data: {gamesWon: userWinner.gamesWon + 1,},});
			userWinner = await this.prisma.user.findFirst({where: {id: gameData.idWinner,}});
			await this.prisma.user.update({where: {id: gameData.idWinner,},data: {score: userWinner.gamesWon - userWinner.gamesLost,},});

			let userLooser = await this.prisma.user.findFirst({where: {id: gameData.idLooser,}});
			await this.prisma.user.update({where: {id: gameData.idLooser,},data: {gamesLost: userLooser.gamesLost + 1,},});
			userLooser = await this.prisma.user.findFirst({where: {id: gameData.idLooser,}});
			await this.prisma.user.update({where: {id: gameData.idLooser,},data: {score: userLooser.gamesWon - userLooser.gamesLost,},});

			// update achievementPong
			await this.prisma.user.update({where: {id: gameData.idWinner,},data: {achievementPong: true,},});

		}

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------  tools ------------------------------------
// ---------------------------------------------------------------------------------------------------------------
	isSocketFromPong(client: Socket) {
		try {
			if (client.handshake.auth.socketType === 'pong')
				return true;

			return false;
		}
		catch(error) {
			return false;
		}
	}

	isClientIdInAGame(ClientId: Number)
	{
		for (const [key, game] of this.gameList)
		{
			if (game.player1.id === ClientId || game.player2.id === ClientId)
			{
				return (true);
			}
		}
		return (false);
	}

	getPlayerFromClientId(ClientId: Number)
	{
		for (const [key, game] of this.gameList)
		{
			if (game.player1.id === ClientId)
			{
				return (game.player1);
			}
			if (game.player2.id === ClientId)
			{
				return (game.player2);
			}
		}
		// TBD ajouter exception dans le cas ou rien est trouvé c?
		return (null);
	}

	isSocketInAGame(ClientId: Number)
	{
		for (const [key, game] of this.gameList)
		{
			if (game.player1.id === ClientId || game.player2.id === ClientId)
			{
				return (true);
			}
		}
		return (false);
	}

	getPlayerfromSocket(socket:Socket)
	{
		for (const [key, game] of this.gameList)
		{
			if (game.player1.socket === socket)
			{
				return (game.player1);
			}
			if (game.player2.socket === socket)
			{
				return (game.player2);
			}
		}
		// TBD ajouter exception dans le cas ou rien est trouvé c?
		return (null);
	}

	findPlayerfromSocket(socket:Socket)
	{
		for (const [key, game] of this.gameList)
		{
			if (game.player1.socket === socket)
			{
				return (game.player1);
			}
			if (game.player2.socket === socket)
			{
				return (game.player2);
			}
		}
		// TBD ajouter exception dans le cas ou rien est trouvé c?
		return (null);
	}

	printAllGameStateLog()
	{
		//console.log("---------------------------------------")
		for (const [key, game] of this.gameList)
		{
			game.printStateLog();
		}
	}

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------  Event catch  ---------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
		async handleConnection(newClient: Socket, ...args: any[])
		{

			// TBD voir si ca a du sens sur le pong
			if (!this.isSocketFromPong(newClient))
			{
				return ;
			}

			// update game list from database (to be sure of )
			this.updateGameList()

			// check if the socket corresponds to a user in the database
			const user = await this.auth.getMe(newClient.handshake.auth.token);
			if (!user) 
			{
				newClient.disconnect();
				return ;
			}
			
			// check if user is in a game
			if (this.isClientIdInAGame(user.id))
			{
				let player = this.getPlayerFromClientId(user.id);
				if (player.socket)
				{
					player.socket.emit('disconnected');
					player.socket.disconnect();
				}
				player.socket = newClient;
				player.username = user.username;
				player.setReady();
				// update player status in User table
				await this.prisma.user.update({
					where: {
					id: user.id,
					},
					data: {
						inGame: true,
					},
				});

			}
			else
			{
				newClient.emit('disconnected');
				newClient.disconnect();
			}	
		}

		async handleDisconnect(disconnectedSocket: Socket)
		{
			let player = this.findPlayerfromSocket(disconnectedSocket);
			if (player)
			{
				player.socket.disconnect();
				player.socket = null;
			}
		}

		@SubscribeMessage('ArrowUpPressed')
		async ArrowUpPressed(socket, message)
		{
			if (!this.isSocketFromPong(socket))
			{
				return ;
			}
			let player = this.findPlayerfromSocket(socket);
			if (player)
			{
				player.ArrowUpPressed = true;
			}
		}
		@SubscribeMessage('ArrowDownPressed')
		async ArrowDownPressed(socket, message)
		{
			if (!this.isSocketFromPong(socket))
			{
				return ;
			}
			let player = this.findPlayerfromSocket(socket);
			if (player)
			{
				player.ArrowDownPressed = true;
			}
		}
		@SubscribeMessage('ArrowUpReleased')
		async ArrowUpReleased(socket, message)
		{	
			if (!this.isSocketFromPong(socket))
			{
				return ;
			}
			let player = this.findPlayerfromSocket(socket);
			if (player)
			{
				player.ArrowUpPressed = false;
			}
		}
		@SubscribeMessage('ArrowDownReleased')
		async ArrowDownReleased(socket, message)
		{
			if (!this.isSocketFromPong(socket))
			{
				return ;
			}
			let player = this.findPlayerfromSocket(socket);
			if (player)
			{
				player.ArrowDownPressed = false;
			}
		}
	}
