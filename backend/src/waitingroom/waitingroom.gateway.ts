import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	} from '@nestjs/websockets';
	import { Server, Socket } from 'socket.io';
	import { PrismaService } from 'src/prisma/prisma.service';
	import { AuthService } from "src/auth/auth.service";
	
export class Client
{
	id: number;
	username: string;
	socket: Socket;
	isReady: boolean;
	hardModeSelected: boolean;

	constructor(id: number, username: string, socket: Socket)
	{
		this.id = id;
		this.username = username;
		this.socket = socket;
		this.isReady = false;
		this.hardModeSelected = false;

	}
}

// to send light data to the frontend
export class ClientLight
{
	id: number;
	username: string;
	isReady: boolean;
	hardModeSelected: boolean;

	constructor(client: Client)
	{
		this.id = client.id;
		this.username = client.username;
		this.isReady = client.isReady;
		this.hardModeSelected = client.hardModeSelected;

	}
}

// ###############################################################################################################
// ###################################################  CORS  ####################################################
// ###############################################################################################################
@WebSocketGateway({
	cors: {
		origin: "*", // specify the domain of your svelte app here
	}
	})

// ###############################################################################################################
// ###################################################  WAITING ROOM  ############################################
// ###############################################################################################################
@WebSocketGateway()
export class WaitingRoomGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect 
{	
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------  Initialisation  // ---------------------------------------
// ---------------------------------------------------------------------------------------------------------------
	@WebSocketServer() server;
	prisma: PrismaService;
	connectedClients = {};

	constructor(private auth: AuthService)
	{
		this.prisma = new PrismaService();

	}
	onModuleInit()
	{
		//console.log("on init waitingroom");
		setInterval(() => {
			this.updateWaitingroom();
		}, 800);
	}
	afterInit()
	{
		
	}

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------  Functions   ----------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
 	updateWaitingroom()
	{
		// Construcion d'un objet light pour envoie des data au frontend
		for (const key in this.connectedClients)
		{
				this.connectedClients[key].socket.emit('updateWaitingRoomState', this.buildLightWaitingRoomState());			
		}
	}

	numberOfReadyClients()
	{
		let readyPlayer = 0;
		for (const key in this.connectedClients)
		{
			const player = this.connectedClients[key];
			if (player.isReady)
			{
				readyPlayer++;
			}
		}
		return (readyPlayer);
	}

	buildLightWaitingRoomState()
	{
		let connectedClientsState = {};
		for (const key in this.connectedClients)
			{
				const player = this.connectedClients[key];
				connectedClientsState[key] = new ClientLight(player);
			}
		return (connectedClientsState);
	}

	generateName(prefix:string)
	{
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

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------  tools ----------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
	isSocketFromWaitingroom(client: Socket) 
	{
		try 
		{
			if (client.handshake.auth.socketType === 'waitingroom')
				return true;

			return false;
		}
		catch(error) {
			return false;
		}

	}

	getConnectedClientFromSocket(socket: Socket)
	{
		for (const key in this.connectedClients)
		{
			if (this.connectedClients[key].socket === socket)
			{
				return (this.connectedClients[key])
			}
		}
		return (null);
	}

	async clientIsInAGame(socket: Socket)
	{
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

		if (checkIdPlayer1 || checkIdPlayer2)
		{
			return true;
		}
		else
		{
			return false;
		}
	}
// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------  Event catch  ---------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
	async handleConnection(socketNewClient: Socket, ...args: any[])
	{
		if (!this.isSocketFromWaitingroom(socketNewClient))
		{
			return ;
		}

		const user = await this.auth.getMe(socketNewClient.handshake.auth.token);
		if (!user) 
		{
			socketNewClient.disconnect();
			return ;
		}
		else
		{
			if (!this.connectedClients[user.id])
			{
				let newClient =  new Client(user.id, user.username , socketNewClient);
				this.connectedClients[user.id] = newClient;
			}
			else
			{
				// if the client is already in the waitingroom, only the socket is updated
				if (this.connectedClients[user.id].socket)
				{
					this.connectedClients[user.id].socket.emit("disconnectedBecauseDoubleSocket")
					this.connectedClients[user.id].socket = socketNewClient;
				}
			}	
			this.connectedClients[user.id].socket.emit("ReadyStatus", this.connectedClients[user.id].isReady);

		}
	}

	async handleDisconnect(disconnectedSocket: Socket)
	{
		for (const key in this.connectedClients)
		{
			const player = this.connectedClients[key];
			if (player.socket === disconnectedSocket)
			{
				//console.log("client connexion lost");   
				delete this.connectedClients[key];
			}
		}
	}

	@SubscribeMessage('playerReady')
	async waitingRoomPlayerReady(socket)
	{
		//console.log("check PlayerReady message");

		if (!this.isSocketFromWaitingroom(socket))
		{
			return ;
		}
		// console.log("waitingRoomPlayerReady, message:", message);
		if (this.getConnectedClientFromSocket(socket))
		{
			// check if a client is in a game to avoid the same client in different games at the same time
			if (await this.clientIsInAGame(socket))
			{
				return;
			}
			let client = this.getConnectedClientFromSocket(socket); // TBD passer cette ligne avec le if et check client
			client.isReady = !client.isReady;
			socket.emit("ReadyStatus", client.isReady);
			//console.log("check ready ", this.getConnectedClientFromSocket(socket).isReady)
		}
		// this.connectedClients[message].isReady = true;

		// get ready players
		let idPlayer1Ready: number;
		let idPlayer2Ready: number;
		for (const key in this.connectedClients)
		{
			const player = this.connectedClients[key];
			if (player.isReady)
			{
				if (idPlayer1Ready)
				{
					idPlayer2Ready = player.id; 
				}
				else
				{
					idPlayer1Ready = player.id; 
				}
			}
		}

		// launch a game if 2 players are ready
		if (this.numberOfReadyClients() >=2)
		{
			//// check the type of game (normal or hardMode)
			//if (this.connectedClients[idPlayer1Ready].hardModeSelected && this.connectedClients[idPlayer2Ready].hardModeSelected)
			//{
			//	let hardMode = true;
			//}
			//else
			//{
			//	let hardMode = false;
 
			//}

			//create game table
			//console.log("push gamedata");
			await this.prisma.runningames.create({
				data: {
					name: this.generateName("game"),
					idPlayer1: idPlayer1Ready,
					idPlayer2: idPlayer2Ready,
					isReadInPongModule: false,
					hardMode: (this.connectedClients[idPlayer1Ready].hardModeSelected && this.connectedClients[idPlayer2Ready].hardModeSelected),
					},
			});

			// send startgame to ready players
			this.connectedClients[idPlayer1Ready].socket.emit('startGame', "gameid");
			this.connectedClients[idPlayer2Ready].socket.emit('startGame', "gameid");
			// remove ready players form waitingroom
			delete this.connectedClients[idPlayer1Ready];
			delete this.connectedClients[idPlayer2Ready];

			//console.log("startgame2players:");
		}
	}

	@SubscribeMessage('changeMode')
	async waitingRoomChangeMode(socket)
	{
		if (!this.isSocketFromWaitingroom(socket))
		{
			return ;
		}
		let client = this.getConnectedClientFromSocket(socket);
		if (client)
		{
			
			client.hardModeSelected = !client.hardModeSelected;
			socket.emit("modeStatus", client.hardModeSelected);
		}
	}
}
