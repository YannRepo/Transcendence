import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt } from "passport-jwt";
import { Strategy } from "passport-jwt";
import { JwtPayload } from "../types";

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.AT_SECRET,
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload) {
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload && payload.exp >= currentTime) {
      return payload;
    }
    return null;
  }
}
