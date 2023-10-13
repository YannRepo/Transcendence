import { ApiProperty } from "@nestjs/swagger";
import { MulterField } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";

export class AvatarDto {
  @ApiProperty({ type: "string", format: "binary" })
  avatar: MulterField;
}
