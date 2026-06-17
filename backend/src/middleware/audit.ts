import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const auditMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!writeMethods.includes(req.method)) return next();

  res.on('finish', async () => {
    try {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.userId ?? null,
          action: req.method,
          resource: req.path,
          details: { body: req.body, statusCode: res.statusCode },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });
    } catch { /* silent */ }
  });

  next();
};
