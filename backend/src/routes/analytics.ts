import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/dashboard', async (req, res) => {
  const userId = req.user!.userId;
  const [simCount, alertCount, challengeCount, recentSims, topUsers] = await Promise.all([
    prisma.simulation.count({ where: { userId } }),
    prisma.alert.count({ where: { userId, isResolved: false } }),
    prisma.challengeProgress.count({ where: { userId, isCompleted: true } }),
    prisma.simulation.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.user.findMany({ orderBy: { securityScore: 'desc' }, take: 10, select: { id: true, username: true, securityScore: true, role: true, avatar: true } }),
  ]);

  const simsByType = await prisma.simulation.groupBy({ by: ['type'], where: { userId }, _count: true });
  const alertsBySeverity = await prisma.alert.groupBy({ by: ['severity'], where: { userId }, _count: true });

  res.json({ simCount, alertCount, challengeCount, recentSims, topUsers, simsByType, alertsBySeverity });
});

router.get('/global', authorize('ADMIN', 'BLUE_TEAM'), async (req, res) => {
  const [totalUsers, totalSims, totalAlerts, criticalAlerts] = await Promise.all([
    prisma.user.count(),
    prisma.simulation.count(),
    prisma.alert.count(),
    prisma.alert.count({ where: { severity: 'CRITICAL', isResolved: false } }),
  ]);

  const recentActivity = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { user: { select: { username: true } } } });

  res.json({ totalUsers, totalSims, totalAlerts, criticalAlerts, recentActivity });
});

export default router;
