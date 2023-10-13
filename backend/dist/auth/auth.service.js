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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const argon = require("argon2");
const jwt = require("jsonwebtoken");
const axios_1 = require("axios");
const prisma_service_1 = require("../prisma/prisma.service");
const strategies_1 = require("./strategies");
const jwt_1 = require("@nestjs/jwt");
let AuthService = exports.AuthService = class AuthService {
    constructor(prisma, jwtService, atStrategy) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.atStrategy = atStrategy;
    }
    async signupLocal(signupDto) {
        try {
            const existingUserWithEmail = await this.prisma.user.findUnique({
                where: {
                    email: signupDto.email,
                },
            });
            if (existingUserWithEmail) {
                throw new common_1.ConflictException("Email already in use");
            }
            const existingUserWithUsername = await this.prisma.user.findUnique({
                where: {
                    username: signupDto.username,
                },
            });
            if (existingUserWithUsername) {
                throw new common_1.ConflictException("Username already in use");
            }
            const hash = await this.hashData(signupDto.password);
            const newUser = await this.prisma.user.create({
                data: {
                    email: signupDto.email,
                    isLogged: false,
                    avatarId: null,
                    inChat: false,
                    inGame: false,
                    IstwoFactorAuth: false,
                    IsSigninWith42: false,
                    username: signupDto.username,
                    hash,
                },
            });
            return newUser;
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            else {
                throw new common_1.InternalServerErrorException("Internal server error");
            }
        }
    }
    async signinLocal(SigninDto) {
        let twoFA;
        const user = await this.prisma.user.findUnique({
            where: {
                email: SigninDto.email,
            },
        });
        if (!user)
            throw new common_1.ForbiddenException("User Does Not Exist");
        const passwordMatches = await argon.verify(user.hash, SigninDto.password);
        if (!passwordMatches)
            throw new common_1.ForbiddenException("Wrong Password");
        if (user.IstwoFactorAuth == false) {
            await this.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    isLogged: true,
                },
            });
        }
        const tokens = await this.getTokens(user.id, user.email);
        this.updateRtHash(user.id, tokens.refresh_token);
        if (user.IstwoFactorAuth) {
            twoFA = true;
        }
        else {
            twoFA = false;
        }
        const response = {
            tokens: {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
            },
            is2FA: twoFA,
        };
        return response;
    }
    async activate2FA(user) {
        if (String(user) === null)
            return false;
        if (user.IstwoFactorAuth == true) {
            await this.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    IstwoFactorAuth: false,
                    userSecret: null,
                },
            });
            return false;
        }
        else {
            await this.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    IstwoFactorAuth: true,
                },
            });
            return true;
        }
    }
    async validate2FACode(userId, validationCode) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                throw new Error("User Does Not Exist");
            }
            const secret = user.userSecret;
            const speakeasy = require("speakeasy");
            const isValidCode = speakeasy.totp.verify({
                secret: secret,
                encoding: "base32",
                token: validationCode,
            });
            if (isValidCode) {
                await this.prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        isLogged: true,
                    },
                });
                return true;
            }
            else {
                throw new Error("Validation code is incorrect");
            }
        }
        catch (error) {
            console.log("error: ", error);
            return false;
        }
    }
    async verify2FACode(userId, validationCode) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            throw new Error("User Does Not Exist");
        }
        const secret = user.userSecret;
        let code = "";
        return Promise.resolve().then(() => require("speakeasy")).then((speakeasy) => {
            const verified = speakeasy.totp.verify({
                secret: secret,
                encoding: "base32",
                token: validationCode,
            });
            if (verified) {
                return true;
            }
            else {
                return this.prisma.user
                    .update({
                    where: {
                        id: userId,
                    },
                    data: {
                        userSecret: null,
                    },
                })
                    .then(() => {
                    return false;
                });
            }
        });
    }
    async generate2FAsecret(userId) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        const speakeasy = require("speakeasy");
        const qrcode = require("qrcode");
        const tempSecret = speakeasy.generateSecret({
            name: process.env.SPEAKEASY_SECRET,
        });
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                userSecret: tempSecret.base32,
            },
        });
        const qrCodeUrl = await new Promise((resolve, reject) => {
            qrcode.toDataURL(tempSecret.otpauth_url, function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
        return qrCodeUrl;
    }
    async getUserInfo(accessToken) {
        const response = await axios_1.default.get("https://api.intra.42.fr/v2/me", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    }
    async getAccessToken(code) {
        try {
            const clientId = process.env.CLIENT_ID;
            const clientSecret = process.env.CLIENT_SECRET;
            const redirectUri = process.env.REDIRECT_URI;
            const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
            const response = await axios_1.default.post("https://api.intra.42.fr/oauth/token", {
                grant_type: "authorization_code",
                code: code,
                redirect_uri: redirectUri,
            }, {
                headers: {
                    Authorization: `Basic ${credentials}`,
                },
            });
            if (response.data && response.data.access_token) {
                return response.data.access_token;
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.error("Erreur lors de la récupération du jeton d'accès:", error);
            return null;
        }
    }
    async create42UserSession(accessToken) {
        const tokenResponse = {
            access_token: accessToken,
            refresh_token: null,
        };
        const userInfo = await this.getUserInfo(accessToken);
        const user = await this.prisma.user.findUnique({
            where: {
                email: userInfo.email,
            },
        });
        if (!user) {
            const newUser = await this.prisma.user.create({
                data: {
                    email: userInfo.email,
                    avatarId: null,
                    isLogged: true,
                    inChat: false,
                    inGame: false,
                    IstwoFactorAuth: false,
                    IsSigninWith42: true,
                    username: userInfo.login,
                    hashedRt: accessToken,
                },
            });
            const avatar = await this.prisma.avatar.create({
                data: {
                    filename: "small_student.jpg",
                    data: Buffer.from(userInfo.image.versions.small),
                    url42: userInfo.image.versions.small,
                    userId: newUser.id,
                },
            });
            await this.prisma.user.update({
                where: { id: newUser.id },
                data: {
                    avatarId: avatar.id,
                },
            });
        }
        else {
            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    hashedRt: accessToken,
                    isLogged: true,
                },
            });
        }
        return tokenResponse;
    }
    async signin42API() {
        try {
            const clientId = process.env.CLIENT_ID;
            const redirectUri = process.env.REDIRECT_URI;
            const authorizationEndpoint = process.env.AUTHORIZATION_ENDPOINT;
            const queryParams = new URLSearchParams({
                client_id: clientId,
                redirect_uri: redirectUri,
                response_type: "code",
                grant_type: "authorization_code",
            });
            const authorizationUrl = `${authorizationEndpoint}?${queryParams.toString()}`;
            return authorizationUrl;
        }
        catch (error) {
            console.error("Error during authorization:", error);
            throw error;
        }
    }
    async logout(userId) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashedRt: {
                    not: null,
                },
            },
            data: {
                hashedRt: null,
                isLogged: false,
            },
        });
    }
    async refreshTokens(userId, rt) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user || !user.hashedRt)
            throw new common_1.ForbiddenException("Access Denied 1");
        const rtMatches = await argon.verify(user.hashedRt, rt);
        if (!rtMatches)
            throw new common_1.ForbiddenException("Access Denied 2");
        const tokens = await this.getTokens((await user).id, (await user).email);
        this.updateRtHash((await user).id, tokens.refresh_token);
        return tokens;
    }
    hashData(data) {
        return argon.hash(data);
    }
    async getUser2FA(authorizationHeader) {
        if (!authorizationHeader)
            return;
        const tokens = authorizationHeader.substring(7).split(",");
        const accessToken = tokens[0].trim();
        const refreshToken = tokens[1].trim();
        if (refreshToken === "null") {
            const hashToken = await this.hashData(accessToken);
            const userAPI = await this.prisma.user.findUnique({
                where: {
                    hashedRt: accessToken,
                },
            });
            return userAPI;
        }
        try {
            const userPayload = await this.parseToken(authorizationHeader);
            const user = await this.prisma.user.findUnique({
                where: {
                    email: userPayload.email,
                },
            });
            return user;
        }
        catch (error) {
            console.log("error GetMe");
            return null;
        }
    }
    async getMe(authorizationHeader) {
        if (!authorizationHeader)
            return;
        const tokens = authorizationHeader.substring(7).split(",");
        const accessToken = tokens[0].trim();
        const refreshToken = tokens[1].trim();
        try {
            if (refreshToken === "null") {
                const hashToken = await this.hashData(accessToken);
                const userAPI = await this.prisma.user.findUnique({
                    where: {
                        hashedRt: accessToken,
                    },
                });
                if (userAPI.isLogged) {
                    return userAPI;
                }
                else {
                    return null;
                }
            }
        }
        catch (error) {
            return null;
        }
        try {
            const userPayload = await this.parseToken(authorizationHeader);
            const user = await this.prisma.user.findUnique({
                where: {
                    email: userPayload.email,
                },
            });
            if (user.isLogged) {
                return user;
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.log("error GetMe");
            return null;
        }
    }
    async updateRtHash(userId, rt) {
        const hash = await this.hashData(rt);
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                hashedRt: hash,
            },
        });
    }
    async getTokens(userId, email) {
        const currentTime = Math.floor(Date.now() / 1000);
        const expirationTime = currentTime + 60 * 60 * 24 * 7;
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({
                sub: userId,
                email,
                exp: expirationTime,
            }, {
                secret: process.env.AT_SECRET,
            }),
            this.jwtService.signAsync({
                sub: userId,
                email,
            }, {
                secret: process.env.RT_SECRET,
                expiresIn: 60 * 60 * 24 * 7,
            }),
        ]);
        return {
            access_token: at,
            refresh_token: rt,
        };
    }
    async parseToken(authorizationHeader) {
        if (!authorizationHeader)
            return;
        const tokens = authorizationHeader.substring(7).split(",");
        const accessToken = tokens[0].trim();
        try {
            const decodedToken = jwt.verify(accessToken, process.env.AT_SECRET);
            const userPayload = this.atStrategy.validate(decodedToken);
            return userPayload;
        }
        catch (error) {
            console.log("Error ParseToken : Can't find user");
            return null;
        }
    }
    async setFirstLoginFalse(userId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { firstLogin: false },
        });
    }
};
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        strategies_1.AtStrategy])
], AuthService);
//# sourceMappingURL=auth.service.js.map