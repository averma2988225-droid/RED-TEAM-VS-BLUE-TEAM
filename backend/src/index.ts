import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import simulationRoutes from './routes/simulations';
import alertRoutes from './routes/alerts';
import challengeRoutes from './routes/challenges';
import vulnerabilityRoutes from './routes/vulnerabilities';
import analyticsRoutes from './routes/analytics';
import adminRoutes from './routes/admin';
import threatRoutes from './routes/threats';
import scanRoutes from './routes/scans';
import { errorHandler } from './middleware/errorHandler';
import { auditMiddleware } from './middleware/audit';
import { setupSocketIO } from './services/socketService';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

setupSocketIO(io);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, try again later.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);
app.use(auditMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/vulnerabilities', vulnerabilityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/threats', threatRoutes);
app.use('/api/scans', scanRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { io };
