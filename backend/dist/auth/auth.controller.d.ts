import { AuthService } from "./auth.service";
import { signupDto, SigninDto } from "./dto";
import { Tokens, signinResponse } from "./types";
import { User } from "@prisma/client";
interface Response {
    [x: string]: any;
    tokens: Tokens;
    user: User;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signupLocal(signupDto: signupDto): Promise<User>;
    signinLocal(SigninDto: SigninDto): Promise<signinResponse>;
    signinExtern(res: any): Promise<string>;
    handleCallback(code: string, res: Response): Promise<any>;
    getMe(authorizationHeader: string): Promise<Response>;
    activate2FA(authorizationHeader: string): Promise<boolean>;
    get2FACode(authorizationHeader: string): Promise<string>;
    validate2FACode(authorizationHeader: string, validationCode: string): Promise<boolean>;
    verify2FACode(authorizationHeader: string, validationCode: string): Promise<boolean>;
    logout(authorizationHeader: string): Promise<any>;
    setFirstLoginFalse(authorizationHeader: string): Promise<User>;
}
export {};
