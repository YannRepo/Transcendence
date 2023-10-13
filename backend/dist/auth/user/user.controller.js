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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const dto_1 = require("./dto");
const user_service_1 = require("./user.service");
const auth_service_1 = require("../auth.service");
let UserController = exports.UserController = class UserController {
    constructor(userService, authService) {
        this.userService = userService;
        this.authService = authService;
    }
    async updateUsername(authorizationHeader, usernameDto) {
        const user = await this.authService.getMe(authorizationHeader);
        if (String(user) === "null")
            return;
        await this.userService.updateUsername(user.id, user.username, usernameDto);
    }
    async getUserById(userId) {
        return this.userService.getUserById(userId);
    }
    async getUsersList() {
        return this.userService.getUsersList();
    }
    async getFriends(authorizationHeader) {
        const user = await this.authService.getMe(authorizationHeader);
        if (String(user) === "null")
            return;
        return this.userService.getFriends(user.id);
    }
    async getNonFriends(authorizationHeader) {
        const user = await this.authService.getMe(authorizationHeader);
        if (String(user) === "null")
            return;
        return this.userService.getNonFriends(user.id);
    }
    async addFriend(authorizationHeader, friendData) {
        const user = await this.authService.getMe(authorizationHeader);
        if (String(user) === "null")
            return;
        const friendId = friendData.friendId;
        return this.userService.addFriend(user.id, friendId);
    }
    async deleteFriend(friendData, authorizationHeader) {
        const user = await this.authService.getMe(authorizationHeader);
        if (String(user) === "null")
            return;
        const friendId = friendData.friendId;
        return this.userService.deleteFriend(user.id, friendId);
    }
    async getUsersSortedByScore() {
        const usersSortedByScore = await this.userService.getUsersSortedByScore();
        return usersSortedByScore;
    }
};
__decorate([
    (0, common_1.Put)("updateUsername"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UserNameDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUsername", null);
__decorate([
    (0, common_1.Get)("getUserById/:userId"),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Get)("list"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsersList", null);
__decorate([
    (0, common_1.Get)("friends/getFriends"),
    __param(0, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getFriends", null);
__decorate([
    (0, common_1.Get)("friends/getNonFriends"),
    __param(0, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getNonFriends", null);
__decorate([
    (0, common_1.Put)("friends/addFriend"),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addFriend", null);
__decorate([
    (0, common_1.Delete)("friends/deleteFriend"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteFriend", null);
__decorate([
    (0, common_1.Get)("sortedByScore"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsersSortedByScore", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)("user"),
    __metadata("design:paramtypes", [user_service_1.UserService,
        auth_service_1.AuthService])
], UserController);
//# sourceMappingURL=user.controller.js.map