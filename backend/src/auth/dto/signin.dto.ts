
import { IsEmail, IsNotEmpty, IsString, IsOptional } from "class-validator"

export class SigninDto{
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}