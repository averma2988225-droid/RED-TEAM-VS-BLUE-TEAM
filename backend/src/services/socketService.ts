import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';

export const setupSocketIO = (io: Server): void => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      (socket as any).user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    socket.join(`user:${user.userId}`);
    socket.join(`role:${user.role}`);

    socket.on('join:simulation', (simId: string) => socket.join(`sim:${simId}`));
    socket.on('leave:simulation', (simId: string) => socket.leave(`sim:${simId}`));
    socket.on('disconnect', () => {});
  });
};

export const emitAlert = (io: Server, userId: string, alert: object): void => {
  io.to(`user:${userId}`).emit('alert:new', alert);
};

export const emitSimulationUpdate = (io: Server, simId: string, data: object): void => {
  io.to(`sim:${simId}`).emit('simulation:update', data);
};

export const emitThreatFeed = (io: Server, threat: object): void => {
  io.to('role:BLUE_TEAM').to('role:ADMIN').emit('threat:detected', threat);
};
