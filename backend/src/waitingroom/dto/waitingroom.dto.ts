import { Transform, Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator"

export class WaitingRoomDto 
{
	readonly name: string;
	
	@IsOptional()
	idPlayer1: number

	@IsOptional()
	idPlayer2:	number

	@IsOptional()
	isLaunched:	boolean
	
}
