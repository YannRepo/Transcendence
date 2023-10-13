import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class ChannelMessageDto {
	@IsNotEmpty()
	@IsNumber()
	@Type(() => Number)
	userId: number

	@IsNotEmpty()
	@IsNumber()
	@Type(() => Number)
	channelId: number

	@IsNotEmpty()
	@IsString()
	message: string
}
