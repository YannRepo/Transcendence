/// <reference types="multer" />
import { Response } from "express";
import { UserService } from "./user.service";
import { Avatar } from "@prisma/client";
import { AuthService } from "../auth.service";
import { AvatarService } from "./avatar.service";
import { PrismaService } from "src/prisma/prisma.service";
export declare class AvatarController {
    private readonly userService;
    private authService;
    private avatarService;
    private prisma;
    constructor(userService: UserService, authService: AuthService, avatarService: AvatarService, prisma: PrismaService);
    uploadAvatar(authorizationHeader: string, avatar: Express.Multer.File): Promise<number>;
    getAvatar(id: string): Promise<Avatar>;
    getAvatarData(id: string, res: Response): Promise<void>;
}
