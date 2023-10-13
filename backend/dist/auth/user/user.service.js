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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UserService = exports.UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateUsername(userId, lastUsername, UsernameDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        const incomingUser = await this.prisma.user.findUnique({
            where: { username: lastUsername },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found.`);
        }
        const existingUsernameUser = await this.prisma.user.findUnique({
            where: { username: UsernameDto.username },
        });
        if (existingUsernameUser) {
            throw new common_1.ConflictException(`Username ${UsernameDto.username} already exists.`);
        }
        if (incomingUser.username !== existingUser.username) {
            throw new common_1.UnauthorizedException("You are not allowed to change the username.");
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { username: UsernameDto.username },
        });
    }
    async updateAvatar(userId, lastUsername, avatar) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        const incomingUser = await this.prisma.user.findUnique({
            where: { username: lastUsername },
        });
        if (!existingUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found.`);
        }
        if (incomingUser.username !== existingUser.username) {
            throw new common_1.UnauthorizedException("You are not allowed to change the username.");
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { avatar: { connect: { id: avatar.id } } },
        });
        return updatedUser.id;
    }
    async getUsersList() {
        return this.prisma.user.findMany();
    }
    async getUserById(id) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: Number(id)
                }
            });
            if (user)
                return user;
            else
                return null;
        }
        catch (error) {
            return null;
        }
    }
    async getNonFriends(userId) {
        const userFriends = await this.prisma.friends.findMany({
            where: {
                userId: userId,
            },
            select: {
                friendId: true,
            },
        });
        const friendIds = userFriends.map((friend) => friend.friendId);
        const nonFriends = await this.prisma.user.findMany({
            where: {
                NOT: {
                    id: {
                        in: [...friendIds, userId],
                    },
                },
            },
        });
        return nonFriends;
    }
    async getFriends(userId) {
        const userFriends = await this.prisma.friends.findMany({
            where: {
                userId: userId,
            },
            select: {
                friendId: true,
            },
        });
        const friendIds = userFriends.map((friend) => friend.friendId);
        const friends = await this.prisma.user.findMany({
            where: {
                id: {
                    in: friendIds,
                },
            },
        });
        return friends;
    }
    async addFriend(userId, friendId) {
        try {
            const existingFriend = await this.prisma.friends.findFirst({
                where: {
                    userId: userId,
                    friendId: friendId,
                },
            });
            if (existingFriend) {
                return false;
            }
            await this.prisma.friends.create({
                data: {
                    userId: userId,
                    friendId: friendId,
                },
            });
            const friend = await this.prisma.user.findUnique({
                where: {
                    id: friendId,
                },
            });
            if (!friend) {
                throw new Error("Friend does not exist.");
            }
            const friendUsername = friend.username;
            return true;
        }
        catch (error) {
            throw new Error("Erreur lors de l'ajout d'ami : " + error.message);
        }
    }
    async deleteFriend(userId, friendId) {
        try {
            const existingFriend = await this.prisma.friends.findFirst({
                where: {
                    userId: userId,
                    friendId: friendId,
                },
            });
            if (!existingFriend) {
                return false;
            }
            await this.prisma.friends.delete({
                where: {
                    id: existingFriend.id,
                },
            });
            return true;
        }
        catch (error) {
            throw new Error("Erreur lors de la suppression de l'ami : " + error.message);
        }
    }
    async getUsersSortedByScore() {
        const usersSortedByScore = await this.prisma.user.findMany({
            orderBy: {
                score: "desc",
            },
        });
        return usersSortedByScore;
    }
};
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map