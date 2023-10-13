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
exports.AuthMiddleware = void 0;
const common_1 = require("@nestjs/common");
const strategies_1 = require("../strategies");
const jwt = require("jsonwebtoken");
let AuthMiddleware = exports.AuthMiddleware = class AuthMiddleware {
    constructor(atStrategy) {
        this.atStrategy = atStrategy;
    }
    async use(req, res, next) {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader && !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }
        const tokens = authorizationHeader.substring(7).split(",");
        const accessToken = tokens[0].trim();
        const refreshToken = tokens[1].trim();
        if (refreshToken !== "null") {
            try {
                const decodedToken = jwt.verify(accessToken, process.env.AT_SECRET);
                const user = this.atStrategy.validate(decodedToken);
                const responseTokens = {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                };
                if (user) {
                    req.user = user;
                    res.tokens = responseTokens;
                }
            }
            catch (_a) {
                return null;
            }
        }
        else {
        }
        next();
    }
};
exports.AuthMiddleware = AuthMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [strategies_1.AtStrategy])
], AuthMiddleware);
//# sourceMappingURL=auth.middleware.js.map