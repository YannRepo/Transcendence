import { NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AtStrategy, RtStrategy } from "../strategies";
import { AuthService } from "../auth.service";
export declare class RefreshTokenMiddleware implements NestMiddleware {
    private readonly authService;
    private readonly atStrategy;
    private readonly rtStrategy;
    constructor(authService: AuthService, atStrategy: AtStrategy, rtStrategy: RtStrategy);
    use(req: Request, res: Response, next: NextFunction): Promise<any>;
}
