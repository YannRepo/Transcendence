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
exports.RefreshTokenMiddleware = void 0;
const common_1 = require("@nestjs/common");
const strategies_1 = require("../strategies");
const jwt = require("jsonwebtoken");
const auth_service_1 = require("../auth.service");
let RefreshTokenMiddleware = exports.RefreshTokenMiddleware = class RefreshTokenMiddleware {
    constructor(authService, atStrategy, rtStrategy) {
        this.authService = authService;
        this.atStrategy = atStrategy;
        this.rtStrategy = rtStrategy;
    }
    async use(req, res, next) {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            res
                .status(200)
                .json({ message: "Middleware bypassed : missing AuthorizationHeader" });
        }
        if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
            const tokens = authorizationHeader.substring(7).split(",");
            const accessToken = tokens[0].trim();
            const refreshToken = tokens[1].trim();
            if (refreshToken !== "null") {
                try {
                    const decodedToken = jwt.decode(accessToken);
                    try {
                        const rtUser = await this.rtStrategy.validate(req, decodedToken);
                    }
                    catch (_a) {
                        return null;
                    }
                    if (decodedToken && this.atStrategy.validate(decodedToken)) {
                    }
                    else {
                        const userId = parseInt(decodedToken.sub, 10);
                        const newAccessToken = await this.authService.refreshTokens(userId, refreshToken);
                        const newAuthorizationHeader = `Bearer ${[
                            newAccessToken.access_token,
                            newAccessToken.refresh_token,
                        ].join(", ")}`;
                        req.headers.authorization = newAuthorizationHeader;
                    }
                }
                catch (error) {
                    console.log("Error occurred while regenerating Access Token:", error);
                }
            }
            else {
            }
            next();
        }
    }
};
exports.RefreshTokenMiddleware = RefreshTokenMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        strategies_1.AtStrategy,
        strategies_1.RtStrategy])
], RefreshTokenMiddleware);
//# sourceMappingURL=refreshToken.middleware.js.map