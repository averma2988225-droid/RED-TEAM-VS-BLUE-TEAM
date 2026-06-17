'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Swords, Shield, Target, AlertTriangle, Clock, Trophy } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import { severityColor, formatRelative, cn, roleColor } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const mockActivity = [
  { day: 'MON', attacks: 4, defenses: 6 },
  { day: 'TUE', attacks: 7, defenses: 5 },
  { day: 'WED', attacks: 3, defenses: 8 },
  { day: 'THU', attacks: 9, defenses: 7 },
  { day: 'FRI', attacks: 5, defenses: 9 },
  { day: 'SAT', attacks: 11, defenses: 10 },
  { day: 'SUN', attacks: 6, defenses: 12 },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
  });

  const scorePercent = Math.min(100, ((user?.securityScore || 0) / 10000) * 100);
  const asciiBar = (pct: number) => {
    const filled = Math.round(pct / 5);
    return '█'.repeat(filled) + '░'.repeat(20 - filled);
  };

  return (
    <div className="flex flex-col flex-1">
      <Header title="OVERVIEW" subtitle={`WELCOME BACK, ${user?.username?.toUpperCase()}`} />
      <div className="p-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard title="SIMULATIONS_RUN" value={stats?.simCount ?? 0} icon={<Swords className="w-3.5 h-3.5" />} change="12%" positive color="text-[#ff0033]" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <StatCard title="ACTIVE_ALERTS" value={stats?.alertCount ?? 0} icon={<AlertTriangle className="w-3.5 h-3.5" />} color="text-[#ffaa00]" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <StatCard title="CHALLENGES_SOLVED" value={stats?.challengeCount ?? 0} icon={<Target className="w-3.5 h-3.5" />} change="8%" positive color="text-[#00ff41]" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <StatCard title="SECURITY_SCORE" value={user?.securityScore?.toLocaleString() ?? 0} icon={<Shield className="w-3.5 h-3.5" />} change="5%" positive color="text-[#00ccff]" />
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Activity chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ATTACK & DEFENSE ACTIVITY</CardTitle>
                  <div className="flex items-center gap-4 text-[10px] text-[#333355] font-mono tracking-wider">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#ff0033] inline-block" /> ATTACKS</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#00ccff] inline-block" /> DEFENSES</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={mockActivity}>
                    <defs>
                      <linearGradient id="attacks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff0033" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ff0033" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="defenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ccff" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#00ccff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#1a1a2e" tick={{ fill: '#333355', fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis stroke="#1a1a2e" tick={{ fill: '#333355', fontSize: 10, fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ background: '#0a0a0f', border: '1px solid #1a1a2e', color: '#00ff41', fontFamily: 'monospace', fontSize: 11 }} />
                    <Area type="monotone" dataKey="attacks" stroke="#ff0033" fill="url(#attacks)" strokeWidth={1.5} />
                    <Area type="monotone" dataKey="defenses" stroke="#00ccff" fill="url(#defenses)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Score */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="h-full">
              <CardHeader><CardTitle>SECURITY_SCORE</CardTitle></CardHeader>
              <CardContent>
                <div className="text-center my-4">
                  <p className="text-3xl font-black text-[#00ff41] font-mono tracking-wider" style={{ textShadow: '0 0 15px rgba(0, 255, 65, 0.3)' }}>
                    {Math.round(scorePercent)}%
                  </p>
                  <p className="text-[10px] text-[#333355] font-mono tracking-wider mt-1">RANK_SCORE</p>
                  <p className="text-sm text-[#00ff41] font-mono mt-2 tracking-[0.3em]">{asciiBar(scorePercent)}</p>
                </div>
                <div className="space-y-3 mt-4">
                  {[
                    { label: 'OFFENSE', val: 72, color: 'text-[#ff0033]' },
                    { label: 'DEFENSE', val: 85, color: 'text-[#00ccff]' },
                    { label: 'ANALYSIS', val: 60, color: 'text-[#8b5cf6]' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[10px] mb-1 font-mono tracking-wider">
                        <span className="text-[#333355]">{item.label}</span>
                        <span className={item.color}>{item.val}%</span>
                      </div>
                      <div className="text-[10px] font-mono tracking-[0.2em]">
                        <span className={item.color}>{'█'.repeat(Math.round(item.val / 5))}</span>
                        <span className="text-[#1a1a2e]">{'░'.repeat(20 - Math.round(item.val / 5))}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Recent simulations */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>RECENT_SIMULATIONS</CardTitle>
                  <Clock className="w-3.5 h-3.5 text-[#333355]" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-[#1a1a2e]/30 animate-pulse" />)}</div>
                ) : stats?.recentSims?.length ? (
                  <div className="space-y-1">
                    {stats.recentSims.map(sim => (
                      <div key={sim.id} className="flex items-center gap-3 p-2.5 hover:bg-[#00ff41]/3 transition-colors font-mono text-[11px]">
                        <span className={`w-1.5 h-1.5 shrink-0 ${sim.status === 'COMPLETED' ? 'bg-[#00ff41]' : sim.status === 'RUNNING' ? 'bg-[#ffaa00] animate-pulse' : 'bg-[#333355]'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[#00ff41] truncate tracking-wider">{sim.title}</p>
                          <p className="text-[9px] text-[#333355] tracking-wider">{formatRelative(sim.createdAt)}</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#00ccff] tracking-wider">+{sim.score}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#333355] text-center py-8 font-mono tracking-wider">NO SIMULATIONS YET. LAUNCH FIRST ATTACK.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>GLOBAL_LEADERBOARD</CardTitle>
                  <Trophy className="w-3.5 h-3.5 text-[#ffaa00]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {(stats?.topUsers || []).slice(0, 6).map((u, i) => (
                    <div key={u.id} className={cn('flex items-center gap-3 p-2 font-mono text-[11px] transition-colors', u.id === user?.id ? 'bg-[#00ff41]/5 border border-[#00ff41]/20' : 'hover:bg-[#00ff41]/3')}>
                      <span className={`w-5 text-center font-bold ${i === 0 ? 'text-[#ffaa00]' : i === 1 ? 'text-[#00ff41]' : i === 2 ? 'text-[#ff6600]' : 'text-[#333355]'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#00ff41] truncate tracking-wider">{u.username}</p>
                      </div>
                      <Badge className={cn('text-[9px]', roleColor[u.role])}>{u.role.replace('_', ' ')}</Badge>
                      <span className="text-[10px] font-bold text-[#00ccff] shrink-0 tracking-wider">{u.securityScore.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
