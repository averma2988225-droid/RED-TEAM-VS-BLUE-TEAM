import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const threats = await prisma.threatFeed.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json(threats);
});

router.post('/', authorize('ADMIN', 'BLUE_TEAM'), async (req, res) => {
  const threat = await prisma.threatFeed.create({ data: req.body });
  res.status(201).json(threat);
});

router.patch('/:id/deactivate', authorize('ADMIN', 'BLUE_TEAM'), async (req, res) => {
  const threat = await prisma.threatFeed.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json(threat);
});

export default router;
