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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
let AuthController = exports.AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async signupLocal(signupDto) {
        try {
            const user = await this.authService.signupLocal(signupDto);
            return user;
        }
        catch (error) {
            return error;
        }
    }
    async signinLocal(SigninDto) {
        const response = await this.authService.signinLocal(SigninDto);
        return response;
    }
    async signinExtern(res) {
        try {
            const authorizationUrl = await this.authService.signin42API();
            res.redirect(302, authorizationUrl);
            return authorizationUrl;
        }
        catch (error) {
            console.error("Error during redirection:", error);
            throw error;
        }
    }
    async handleCallback(code, res) {
        try {
            const accessToken = await this.authService.getAccessToken(code);
            const tokens = await this.authService.create42UserSession(accessToken);
            res.redirect(`${process.env.PUBLIC_FRONT_URL}/auth/login?accessToken=${tokens.access_token}&refreshToken=${tokens.refresh_token}`);
            return tokens;
        }
        catch (error) {
            return res.status(500).json({ message: "Une erreur est survenue" });
        }
    }
    async getMe(authorizationHeader) {
        const user = await this.authService.getMe(authorizationHeader);
        const tokens = authorizationHeader.substring(7).split(",");
        const accessToken = tokens[0].trim();
        const refreshToken = tokens[1].trim();
        const response = {
            tokens: {
                access_token: accessToken,
                refresh_token: refreshToken,
            },
            user,
        };
        return response;
    }
    async activate2FA(authorizationHeader) {
        const user = await this.authService.getMe(authorizationHeader);
        try {
            return this.authService.activate2FA(user);
        }
        catch (error) {
            return null;
        }
    }
    async get2FACode(authorizationHeader) {
        const user = await this.authService.getUser2FA(authorizationHeader);
        const qrCodeUrl = await this.authService.generate2FAsecret(user.id);
        return qrCodeUrl;
    }
    async validate2FACode(authorizationHeader, validationCode) {
        const user = await this.authService.getUser2FA(authorizationHeader);
        return this.authService.validate2FACode(user.id, validationCode);
    }
    async verify2FACode(authorizationHeader, validationCode) {
        const user = await this.authService.getUser2FA(authorizationHeader);
        return this.authService.verify2FACode(user.id, validationCode);
    }
    async logout(authorizationHeader) {
        const user = await this.authService.getMe(authorizationHeader);
        try {
            this.authService.logout(user.id);
        }
        catch (error) {
            return null;
        }
    }
    async setFirstLoginFalse(authorizationHeader) {
        const user = await this.authService.getMe(authorizationHeader);
        if (user) {
            const updatedUser = await this.authService.setFirstLoginFalse(user.id);
            return updatedUser;
        }
        else {
            return null;
        }
    }
};
__decorate([
    (0, common_1.Post)("local/signup"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.signupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signupLocal", null);
__decorate([
    (0, common_1.Post)("local/signin"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SigninDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signinLocal", null);
__decorate([
    (0, common_1.Get)("local/signinExtern"),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signinExtern", null);
__decorate([
    (0, common_1.Get)("local/handleCallback"),
    __param(0, (0, common_1.Query)("code")),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "handleCallback", null);
__decorate([
    (0, common_1.Get)("getMe"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Put)("activate2FA"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "activate2FA", null);
__decorate([
    (0, common_1.Get)("get2FACode"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "get2FACode", null);
__decorate([
    (0, common_1.Post)("validate2FACode"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Body)("validationCode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validate2FACode", null);
__decorate([
    (0, common_1.Post)("verify2FACode"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)("authorization")),
    __param(1, (0, common_1.Body)("validationCode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2FACode", null);
__decorate([
    (0, common_1.Post)("logout"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)("firstLogin"),
    __param(0, (0, common_1.Headers)("authorization")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setFirstLoginFalse", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map