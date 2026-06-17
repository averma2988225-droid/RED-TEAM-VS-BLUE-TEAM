import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { severity, resolved } = req.query as Record<string, string>;
  const where: any = { userId: req.user!.userId };
  if (severity) where.severity = severity;
  if (resolved !== undefined) where.isResolved = resolved === 'true';
  const alerts = await prisma.alert.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json(alerts);
});

router.post('/', authorize('ADMIN', 'RED_TEAM', 'BLUE_TEAM'), async (req, res) => {
  const { title, description, severity, category, source } = req.body;
  const alert = await prisma.alert.create({ data: { title, description, severity, category, source, userId: req.user!.userId } });
  res.status(201).json(alert);
});

router.patch('/:id/resolve', async (req, res) => {
  const alert = await prisma.alert.update({
    where: { id: req.params.id, userId: req.user!.userId },
    data: { isResolved: true, resolvedAt: new Date() },
  });
  res.json(alert);
});

router.delete('/:id', async (req, res) => {
  await prisma.alert.delete({ where: { id: req.params.id, userId: req.user!.userId } });
  res.json({ message: 'Alert deleted' });
});

export default router;
