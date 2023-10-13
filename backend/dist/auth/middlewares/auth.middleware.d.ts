import { NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AtStrategy } from "../strategies";
export declare class AuthMiddleware implements NestMiddleware {
    private readonly atStrategy;
    constructor(atStrategy: AtStrategy);
    use(req: Request, res: Response, next: NextFunction): Promise<any>;
}
