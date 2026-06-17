import jwt, { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from '../types';

export const signAccessToken = (payload: JwtPayload): string => {
  const opts: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) || '15m' };
  return jwt.sign(payload as object, process.env.JWT_SECRET!, opts);
};

export const signRefreshToken = (payload: JwtPayload): string => {
  const opts: SignOptions = { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']) || '7d' };
  return jwt.sign(payload as object, process.env.JWT_REFRESH_SECRET!, opts);
};

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
