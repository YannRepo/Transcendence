import { ChannelType } from "@prisma/client"
import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator"

export class ChannelDto {
	@IsNotEmpty()
	@IsString()
	@Length(0, 40)
	name: string

	@IsOptional()
	@IsString()
	@Length(0, 100)
	description: string

	@IsOptional()
	@IsString()
	password: string

	@IsNotEmpty()
	@IsString()
	type: ChannelType

	@IsNotEmpty()
	@IsNumber()
	@Type(() => Number)
	userId: number
}
