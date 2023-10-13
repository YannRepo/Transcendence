import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AtStrategy, RtStrategy } from "../strategies";
import * as jwt from "jsonwebtoken";
import { JwtPayload } from "../types";
import { AuthService } from "../auth.service";

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly atStrategy: AtStrategy,
    private readonly rtStrategy: RtStrategy
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // console.log("Refresh Token middleware called");
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      res
        .status(200)
        .json({ message: "Middleware bypassed : missing AuthorizationHeader" });
    }

    // console.log(authorizationHeader);
    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      const tokens = authorizationHeader.substring(7).split(",");
      const accessToken = tokens[0].trim();
      const refreshToken = tokens[1].trim();

      // console.log(refreshToken);
      if (refreshToken !== "null") {
        try {
          const decodedToken = jwt.decode(accessToken) as JwtPayload;
          try {
            const rtUser = await this.rtStrategy.validate(req, decodedToken);
          } catch {
            //console.log("error: refresh token has expired");
            return null;
          }
          if (decodedToken && this.atStrategy.validate(decodedToken)) {
            //console.log("Access Token is valid");
          } else {
            //console.log("Access Token has expired");
            const userId: number = parseInt(decodedToken.sub, 10);
            const newAccessToken = await this.authService.refreshTokens(
              userId,
              refreshToken
            );
            const newAuthorizationHeader = `Bearer ${[
              newAccessToken.access_token,
              newAccessToken.refresh_token,
            ].join(", ")}`;

            // Mise à jour de l'access token dans le header de la requête
            req.headers.authorization = newAuthorizationHeader;
            //console.log("New Access Token:", newAccessToken);
          }
        } catch (error) {
          console.log("Error occurred while regenerating Access Token:", error);
        }
      } else {
        // means that the user is connected via 42 API : we don't want to do anything.
        //console.log("API 42 Refresh Midleware");
      }
      next();
    }
  }
}
