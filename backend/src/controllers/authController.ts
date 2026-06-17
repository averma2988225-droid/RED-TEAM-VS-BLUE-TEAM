import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  const { email, username, password } = req.body;
  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (exists) { res.status(409).json({ error: 'Email or username already taken' }); return; }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, username, password: hashed } });
  const payload = { userId: user.id, email: user.email, role: user.role };

  res.status(201).json({
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
    user: { id: user.id, email: user.email, username: user.username, role: user.role },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(400).json({ errors: errors.array() }); return; }

  const { email, password, totpCode } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials' }); return;
  }
  if (!user.isActive) { res.status(403).json({ error: 'Account deactivated' }); return; }

  if (user.twoFactorEnabled) {
    if (!totpCode) { res.status(200).json({ requiresTwoFactor: true }); return; }
    if (!authenticator.verify({ token: totpCode, secret: user.twoFactorSecret! })) {
      res.status(401).json({ error: 'Invalid 2FA code' }); return;
    }
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  const payload = { userId: user.id, email: user.email, role: user.role };
  const rt = signRefreshToken(payload);
  await prisma.refreshToken.create({
    data: { token: rt, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  res.json({
    accessToken: signAccessToken(payload),
    refreshToken: rt,
    user: { id: user.id, email: user.email, username: user.username, role: user.role, securityScore: user.securityScore, twoFactorEnabled: user.twoFactorEnabled },
  });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: rt } = req.body;
  if (!rt) { res.status(401).json({ error: 'No refresh token' }); return; }

  try {
    const payload = verifyRefreshToken(rt);
    const stored = await prisma.refreshToken.findUnique({ where: { token: rt } });
    if (!stored || stored.expiresAt < new Date()) { res.status(401).json({ error: 'Invalid refresh token' }); return; }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) { res.status(401).json({ error: 'User not found' }); return; }

    const newPayload = { userId: user.id, email: user.email, role: user.role };
    res.json({ accessToken: signAccessToken(newPayload) });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: rt } = req.body;
  if (rt) await prisma.refreshToken.deleteMany({ where: { token: rt } });
  res.json({ message: 'Logged out successfully' });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  // Always return 200 to prevent email enumeration
  if (!user) { res.json({ message: 'If that email exists, a reset link was sent.' }); return; }
  // In production: generate token, store hash, send email
  const token = uuidv4();
  res.json({ message: 'If that email exists, a reset link was sent.', devToken: token });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;
  // In production: validate token from DB
  res.json({ message: 'Password reset functionality requires email setup.' });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, username: true, role: true, avatar: true, bio: true, securityScore: true, twoFactorEnabled: true, createdAt: true, lastLogin: true },
  });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(user);
};

export const setupTwoFactor = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }

  const secret = authenticator.generateSecret();
  const otpauth = authenticator.keyuri(user.email, process.env.TOTP_SERVICE_NAME || 'CyberRange', secret);
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret } });
  const qrCode = await QRCode.toDataURL(otpauth);
  res.json({ secret, qrCode });
};

export const verifyTwoFactor = async (req: Request, res: Response): Promise<void> => {
  const { code } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user?.twoFactorSecret) { res.status(400).json({ error: '2FA not set up' }); return; }

  const valid = authenticator.verify({ token: code, secret: user.twoFactorSecret });
  if (!valid) { res.status(401).json({ error: 'Invalid code' }); return; }

  await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
  res.json({ message: '2FA enabled successfully' });
};
