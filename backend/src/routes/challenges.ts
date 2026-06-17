import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const challenges = await prisma.challenge.findMany({ where: { isActive: true }, orderBy: { points: 'asc' } });
  const progress = await prisma.challengeProgress.findMany({ where: { userId: req.user!.userId } });
  const progressMap = Object.fromEntries(progress.map(p => [p.challengeId, p]));
  res.json(challenges.map(c => ({ ...c, solution: undefined, progress: progressMap[c.id] || null })));
});

router.post('/:id/submit', async (req, res) => {
  const { answer } = req.body;
  const challenge = await prisma.challenge.findUnique({ where: { id: req.params.id } });
  if (!challenge) { res.status(404).json({ error: 'Challenge not found' }); return; }

  const isCorrect = answer.trim().toLowerCase().includes(challenge.solution.toLowerCase());
  const progress = await prisma.challengeProgress.upsert({
    where: { userId_challengeId: { userId: req.user!.userId, challengeId: challenge.id } },
    update: { attempts: { increment: 1 }, ...(isCorrect ? { isCompleted: true, score: challenge.points, completedAt: new Date() } : {}) },
    create: { userId: req.user!.userId, challengeId: challenge.id, attempts: 1, isCompleted: isCorrect, score: isCorrect ? challenge.points : 0, completedAt: isCorrect ? new Date() : null },
  });

  if (isCorrect) {
    await prisma.user.update({ where: { id: req.user!.userId }, data: { securityScore: { increment: challenge.points } } });
  }

  res.json({ correct: isCorrect, progress });
});

router.post('/', authorize('ADMIN'), async (req, res) => {
  const challenge = await prisma.challenge.create({ data: req.body });
  res.status(201).json(challenge);
});

export default router;
