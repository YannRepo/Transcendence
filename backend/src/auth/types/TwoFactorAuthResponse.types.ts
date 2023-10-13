import { Tokens } from "./tokens.type";

export interface TwoFactorAuthResponse {
  qrCodeUrl: string;
  secret: string;
}

export interface signinResponse {
  tokens: Tokens;
  is2FA: boolean;
}
