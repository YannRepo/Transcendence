import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

export class SourcebansDto {
	@IsNotEmpty()
	@IsNumber()
	@Type(() => Number)
	userId: number

	@IsNotEmpty()
	@IsString()
	adminUsername: string

	@IsNotEmpty()
	@IsString()
	type: string

	@IsNotEmpty()
	@IsNumber()
	@Type(() => Number)
	duration: number

	@IsOptional()
	@IsString()
	reason: string
}
