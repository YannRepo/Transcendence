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
exports.ChannelController = void 0;
const common_1 = require("@nestjs/common");
const channel_service_1 = require("./channel.service");
const dto_1 = require("./dto");
const client_1 = require("@prisma/client");
const channelusers_service_1 = require("../users/channelusers.service");
let ChannelController = exports.ChannelController = class ChannelController {
    constructor(channelService, channelUser) {
        this.channelService = channelService;
        this.channelUser = channelUser;
    }
    createChannel(dto) {
        return this.channelService.createChannel(dto);
    }
    getChannels() {
        return this.channelService.getChannels();
    }
    getConversations(fromUserId) {
        return this.channelService.getUserConversations(fromUserId);
    }
    getChannelById(id) {
        return this.channelService.getChannelById(id);
    }
    getChannelByName(name) {
        return this.channelService.getChannelByName(name);
    }
    setChannelName(id, name) {
        if (name === undefined)
            return ({ error: "No name given." });
        return this.channelService.setChannelName(id, name);
    }
    setChannelDescription(id, description) {
        if (description === undefined)
            return ({ error: "No description given." });
        return this.channelService.setChannelDescription(id, description);
    }
    setChannelPassword(id, password) {
        if (password === undefined)
            return ({ error: "No password given." });
        return this.channelService.setChannelPassword(id, password);
    }
    setChannelType(id, type) {
        if (type === undefined)
            return ({ error: "No type given." });
        return this.channelService.setChannelType(id, type);
    }
    deleteChannelById(id) {
        return this.channelService.deleteChannelById(id);
    }
    getUsersFromChannel(channelId) {
        return this.channelUser.getUsersFromChannel(channelId);
    }
    getUserFromChannelById(userId, channelId) {
        return this.channelUser.getChannelUserByIds(userId, channelId);
    }
    getUserPunishment(userId, channelId) {
        return this.channelUser.getUserPunishments(userId, channelId);
    }
};
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ always: true })),
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ChannelDto]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "createChannel", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getChannels", null);
__decorate([
    (0, common_1.Get)('conversations/:fromUserId'),
    __param(0, (0, common_1.Param)('fromUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChannelController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('id/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "getChannelById", null);
__decorate([
    (0, common_1.Get)('name/:name'),
    __param(0, (0, common_1.Param)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "getChannelByName", null);
__decorate([
    (0, common_1.Put)(':id/name'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "setChannelName", null);
__decorate([
    (0, common_1.Put)(':id/description'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('description')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "setChannelDescription", null);
__decorate([
    (0, common_1.Put)(':id/password'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "setChannelPassword", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ always: true })),
    (0, common_1.Put)(':id/type'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "setChannelType", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "deleteChannelById", null);
__decorate([
    (0, common_1.Get)(':channelId/getUsers'),
    __param(0, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "getUsersFromChannel", null);
__decorate([
    (0, common_1.Get)(':channelId/getUser/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "getUserFromChannelById", null);
__decorate([
    (0, common_1.Get)(':channelId/getUser/:userId/punishments'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('channelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], ChannelController.prototype, "getUserPunishment", null);
exports.ChannelController = ChannelController = __decorate([
    (0, common_1.Controller)('chat/channel'),
    __metadata("design:paramtypes", [channel_service_1.ChannelService,
        channelusers_service_1.ChannelUsersService])
], ChannelController);
//# sourceMappingURL=channel.controller.js.map