import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', authorize('ADMIN'), async (req, res) => {
  const { page = '1', limit = '20', role, search } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where: any = {};
  if (role) where.role = role;
  if (search) where.OR = [{ username: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: parseInt(limit), select: { id: true, email: true, username: true, role: true, securityScore: true, isActive: true, createdAt: true, lastLogin: true }, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);
  res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
});

router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, email: true, username: true, role: true, avatar: true, bio: true, securityScore: true, createdAt: true } });
  if (!user) { res.status(404).json({ error: 'User not found' }); return; }
  res.json(user);
});

router.patch('/me', async (req, res) => {
  const { username, bio, avatar } = req.body;
  const user = await prisma.user.update({ where: { id: req.user!.userId }, data: { username, bio, avatar }, select: { id: true, email: true, username: true, role: true, avatar: true, bio: true, securityScore: true } });
  res.json(user);
});

router.patch('/:id/status', authorize('ADMIN'), async (req, res) => {
  const { isActive } = req.body;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive }, select: { id: true, isActive: true } });
  res.json(user);
});

export default router;
