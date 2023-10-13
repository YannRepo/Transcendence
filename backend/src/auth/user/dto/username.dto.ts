import { IsNotEmpty, IsString, Length } from "class-validator";

export class UserNameDto {
  @IsString()
  @IsNotEmpty()
  @Length(0, 15)
  username: string;
}
