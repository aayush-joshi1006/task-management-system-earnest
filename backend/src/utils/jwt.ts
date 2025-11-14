import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

export interface UserPayload extends JwtPayload {
  userId: string;
}

function signOptions(expiresIn: string): SignOptions {
  return { expiresIn: expiresIn as unknown as SignOptions["expiresIn"] };
}

export function signAccessToken(payload: UserPayload): string {
  return jwt.sign(
    payload as object,
    ACCESS_SECRET,
    signOptions(ACCESS_EXPIRES)
  );
}

export function signRefreshToken(payload: UserPayload): string {
  return jwt.sign(
    payload as object,
    REFRESH_SECRET,
    signOptions(REFRESH_EXPIRES)
  );
}

export function verifyAccessToken(token: string): UserPayload {
  return jwt.verify(token, ACCESS_SECRET) as UserPayload;
}

export function verifyRefreshToken(token: string): UserPayload {
  return jwt.verify(token, REFRESH_SECRET) as UserPayload;
}
