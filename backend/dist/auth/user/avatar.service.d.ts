/// <reference types="node" />
import { PrismaService } from "src/prisma/prisma.service";
import { Avatar } from "@prisma/client";
export declare class AvatarService {
    private prisma;
    constructor(prisma: PrismaService);
    createAvatar(fileName: string, data: Buffer, userId: number): Promise<Avatar>;
    generateUniqueFileName(originalFileName: string): Promise<string>;
    getAvatarData(id: number): Promise<Avatar | null>;
    generateAvatarURL(avatarId: number): Promise<string>;
    deleteAvatar(avatarId: number): Promise<void>;
}
