import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate, authorize('ADMIN'));

router.get('/stats', async (_req, res) => {
  const [users, simulations, alerts, challenges] = await Promise.all([
    prisma.user.count(),
    prisma.simulation.count(),
    prisma.alert.count(),
    prisma.challenge.count(),
  ]);
  const activeUsers = await prisma.user.count({ where: { isActive: true } });
  const criticalAlerts = await prisma.alert.count({ where: { severity: 'CRITICAL', isResolved: false } });
  res.json({ users, simulations, alerts, challenges, activeUsers, criticalAlerts });
});

router.get('/audit-logs', async (req, res) => {
  const { page = '1', limit = '50' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const logs = await prisma.auditLog.findMany({
    skip, take: parseInt(limit), orderBy: { createdAt: 'desc' },
    include: { user: { select: { username: true, email: true } } },
  });
  res.json(logs);
});

router.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role }, select: { id: true, role: true } });
  res.json(user);
});

export default router;
