import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Avatar } from "@prisma/client";
import * as crypto from "crypto";
import * as path from "path";

@Injectable()
export class AvatarService {
  constructor(private prisma: PrismaService) {}
  async createAvatar(
    fileName: string,
    data: Buffer,
    userId: number
  ): Promise<Avatar> {
    const newAvatar = await this.prisma.avatar.create({
      data: {
        filename: fileName,
        data: data,
        userId: userId,
      },
    });
    return newAvatar;
  }

  async generateUniqueFileName(originalFileName: string): Promise<string> {
    // Obtenir l'horodatage actuel (en millisecondes)
    const timestamp = new Date().getTime();

    // Générer un identifiant unique (en utilisant un hachage)
    const uniqueId = crypto.randomBytes(16).toString("hex");

    // Extraire l'extension du fichier d'origine
    const fileExtension = path.extname(originalFileName);

    // Combiner le timestamp, l'identifiant unique et l'extension pour obtenir un nom de fichier unique
    const uniqueFileName = `${timestamp}-${uniqueId}${fileExtension}`;

    return uniqueFileName;
  }

  async getAvatarData(id: number): Promise<Avatar | null> {
    //console.log(id);
    return this.prisma.avatar.findUnique({ where: { id: id } });
  }

  async generateAvatarURL(avatarId: number): Promise<string> {
    // Récupérez les données de l'avatar à partir de la base de données
    const avatar = await this.prisma.avatar.findUnique({
      where: { id: avatarId },
    });

    if (!avatar) {
      throw new NotFoundException("Avatar not found");
    }
    // const avatarURL = `http://localhost:3000/avatar/data/${avatar.id}`;
    const avatarURL = `http://${process.env.PUBLIC_API_URL}/avatar/data/${avatar.id}`;
    //console.log("URL = ", avatarURL);
    return avatarURL;
  }

  async deleteAvatar(avatarId: number) {
    //console.log("id to delete", avatarId);
    await this.prisma.avatar.delete({
      where: {
        id: avatarId,
      },
    });
  }
}
