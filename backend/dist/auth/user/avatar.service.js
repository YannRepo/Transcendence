"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvatarService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto = require("crypto");
const path = require("path");
let AvatarService = exports.AvatarService = class AvatarService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAvatar(fileName, data, userId) {
        const newAvatar = await this.prisma.avatar.create({
            data: {
                filename: fileName,
                data: data,
                userId: userId,
            },
        });
        return newAvatar;
    }
    async generateUniqueFileName(originalFileName) {
        const timestamp = new Date().getTime();
        const uniqueId = crypto.randomBytes(16).toString("hex");
        const fileExtension = path.extname(originalFileName);
        const uniqueFileName = `${timestamp}-${uniqueId}${fileExtension}`;
        return uniqueFileName;
    }
    async getAvatarData(id) {
        return this.prisma.avatar.findUnique({ where: { id: id } });
    }
    async generateAvatarURL(avatarId) {
        const avatar = await this.prisma.avatar.findUnique({
            where: { id: avatarId },
        });
        if (!avatar) {
            throw new common_1.NotFoundException("Avatar not found");
        }
        const avatarURL = `http://${process.env.PUBLIC_API_URL}/avatar/data/${avatar.id}`;
        return avatarURL;
    }
    async deleteAvatar(avatarId) {
        await this.prisma.avatar.delete({
            where: {
                id: avatarId,
            },
        });
    }
};
exports.AvatarService = AvatarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvatarService);
//# sourceMappingURL=avatar.service.js.map