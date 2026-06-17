import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { severity, category } = req.query as Record<string, string>;
  const where: any = {};
  if (severity) where.severity = severity;
  if (category) where.category = category;
  const vulns = await prisma.vulnerability.findMany({ where, orderBy: { cvssScore: 'desc' } });
  res.json(vulns);
});

export default router;
