"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const chat_controller_1 = require("./chat.controller");
const chat_service_1 = require("./chat.service");
const chat_gateway_1 = require("./gateway/chat.gateway");
const message_service_1 = require("./message/message.service");
const channel_module_1 = require("./channel/channel.module");
const auth_service_1 = require("../auth/auth.service");
const jwt_1 = require("@nestjs/jwt");
const strategies_1 = require("../auth/strategies");
const channel_service_1 = require("./channel/channel.service");
const channelusers_service_1 = require("./users/channelusers.service");
const user_service_1 = require("../auth/user/user.service");
let ChatModule = exports.ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [channel_module_1.ChannelModule],
        controllers: [chat_controller_1.ChatController],
        providers: [chat_service_1.ChatService, channel_service_1.ChannelService, chat_gateway_1.ChatGateway,
            message_service_1.MessageService, channelusers_service_1.ChannelUsersService, auth_service_1.AuthService,
            user_service_1.UserService, jwt_1.JwtService, strategies_1.AtStrategy]
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map