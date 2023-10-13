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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvatarController = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const stream_1 = require("stream");
const platform_express_1 = require("@nestjs/platform-express");
const user_service_1 = require("./user.service");
const auth_service_1 = require("../auth.service");
const avatar_service_1 = require("./avatar.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const maxFileSizeInMegabytes = 5;
let AvatarController = exports.AvatarController = class AvatarController {
    constructor(userService, authService, avatarService, prisma) {
        this.userService = userService;
        this.authService = authService;
        this.avatarService = avatarService;
        this.prisma = prisma;
    }
    async uploadAvatar(authorizationHeader, avatar) {
        try {
            const user = await this.authService.getMe(authorizationHeader);
            if ((0, path_1.extname)(avatar.originalname) !== ".jpeg" &&
                (0, path_1.extname)(avatar.originalname) !== ".jpg") {
                throw common_1.BadRequestException;
            }
            if (user.achievementAvatar == false && user.avatarId == null) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        achievementAvatar: true,
                    },
                });
            }
            const uniqueFileName = await this.avatarService.generateUniqueFileName(avatar.originalname);
            const newAvatar = await this.avatarService.createAvatar(uniqueFileName, avatar.buffer, user.id);
            await this.userService.updateAvatar(user.id, user.username, newAvatar);
            return newAvatar.id;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException("Error: can't download avatar.");
        }
    }
    async getAvatar(id) {
        const avatarId = parseInt(id);
        const avatar = await this.avatarService.getAvatarData(avatarId);
        return avatar;
    }
    async getAvatarData(id, res) {
        try {
            const avatarId = parseInt(id);
            const avatar = await this.avatarService.getAvatarData(avatarId);
            if (!avatar || !avatar.data) {
                throw new common_1.NotFoundException("Error: avatar not found");
            }
            const avatarURL = await this.avatarService.generateAvatarURL(avatar.id);
            const imageStream = new stream_1.Readable({
                read() {
                    this.push(avatar.data);
                    this.push(null);
                },
            });
            res.send(avatar.data);
        }
        catch (error) {
        }
    }
};
__decorate([
    (0, common_1.Post)("uploadAvatar"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("avatar", {
        limits: {
            fileSize: maxFileSizeInMegabytes * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AvatarController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Get)("getAvatar/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AvatarController.prototype, "getAvatar", null);
__decorate([
    (0, common_1.Get)("data/:id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AvatarController.prototype, "getAvatarData", null);
exports.AvatarController = AvatarController = __decorate([
    (0, common_1.Controller)("avatar"),
    __metadata("design:paramtypes", [user_service_1.UserService,
        auth_service_1.AuthService,
        avatar_service_1.AvatarService,
        prisma_service_1.PrismaService])
], AvatarController);
//# sourceMappingURL=avatar.controller.js.map