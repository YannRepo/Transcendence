import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber } from "class-validator"

export class UserChannelDto {
	@IsNotEmpty()
	@IsNumber()
	@Type(() => Number)
	channelId: number

	@IsNotEmpty()
	@IsNumber()
	@Type(() => Number)
	userId: number
}
