import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AtStrategy } from "../strategies";
import * as jwt from "jsonwebtoken";
import { Tokens, JwtPayload } from "../types";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly atStrategy: AtStrategy) {}

  async use(req: Request, res: Response, next: NextFunction) {
    //console.log("Auth middleware called");
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader && !authorizationHeader.startsWith("Bearer ")) {
      return null;
    }
    //console.log('\x1b[32m%s\x1b[0m', authorizationHeader);
    const tokens = authorizationHeader.substring(7).split(",");
    const accessToken = tokens[0].trim();
    const refreshToken = tokens[1].trim();
    if (refreshToken !== "null") {
      try {
        const decodedToken = jwt.verify(
          accessToken,
          process.env.AT_SECRET
        ) as JwtPayload;
        const user = this.atStrategy.validate(decodedToken);
        const responseTokens: Tokens = {
          access_token: accessToken,
          refresh_token: refreshToken,
        };
        if (user) {
          //console.log("ACCESS TOKEN VALID");
          req.user = user;
          // need to send token for xavier in response
          (res as Response & { tokens: Tokens }).tokens = responseTokens;
        }
      } catch {
        // console.log("error: token has expired");
        return null;
      }
    } else {
      // console.log("API 42 : Auth Middleware"); // Here to debeug : need to remove
    }
    next();
  }
}
