'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Users, Trophy, Timer, Play, Star, Lock } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const scenarios = [
  { id: 1, title: 'HACK_THE_BANK', difficulty: 'Medium', players: 2847, duration: '45 MIN', tags: ['SQLi', 'AUTH_BYPASS', 'PRIV_ESC'], rating: 4.8, active: true },
  { id: 2, title: 'CORPORATE_ESPIONAGE', difficulty: 'Hard', players: 1203, duration: '90 MIN', tags: ['OSINT', 'PHISHING', 'LATERAL_MOVE'], rating: 4.9, active: true },
  { id: 3, title: 'MEDICAL_RECORDS_BREACH', difficulty: 'Easy', players: 5621, duration: '30 MIN', tags: ['IDOR', 'XSS', 'DATA_EXFIL'], rating: 4.6, active: true },
  { id: 4, title: 'CRITICAL_INFRASTRUCTURE', difficulty: 'Expert', players: 412, duration: '180 MIN', tags: ['ICS/SCADA', 'ZERO_DAY', 'APT'], rating: 5.0, active: false },
];

const leaderboard = [
  { rank: 1, username: 'n3cr0_h4x0r', score: 12840, time: '23:41', country: '🇺🇸' },
  { rank: 2, username: 'cyb3r_samu4i', score: 11200, time: '31:05', country: '🇯🇵' },
  { rank: 3, username: 'bl4ck_pant3r', score: 10750, time: '28:59', country: '🇩🇪' },
  { rank: 4, username: 'r3d_ph4ntom', score: 9900, time: '35:20', country: '🇬🇧' },
  { rank: 5, username: 'null_ptr_x', score: 9200, time: '40:11', country: '🇧🇷' },
];

const difficultyColor: Record<string, string> = {
  Easy: 'text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/20',
  Medium: 'text-[#ffaa00] bg-[#ffaa00]/10 border-[#ffaa00]/20',
  Hard: 'text-[#ff6600] bg-[#ff6600]/10 border-[#ff6600]/20',
  Expert: 'text-[#ff0033] bg-[#ff0033]/10 border-[#ff0033]/20',
};

export default function CyberRangePage() {
  const [activeScenario, setActiveScenario] = useState<number | null>(null);
  const [attackLog, setAttackLog] = useState<string[]>([]);

  const startScenario = (id: number) => {
    setActiveScenario(id);
    const logs = [
      'Initializing virtual environment...',
      'Deploying vulnerable target system...',
      'Configuring network isolation...',
      'Starting monitoring agent...',
      'Ready! Attack surface exposed on 10.13.37.1',
    ];
    setAttackLog([]);
    logs.forEach((log, i) => setTimeout(() => setAttackLog(p => [...p, log]), i * 600));
  };

  return (
    <div className="flex flex-col flex-1">
      <Header title="CYBER RANGE" subtitle="LIVE ATTACK-AND-DEFENSE SCENARIOS WITH SCORING" />
      <div className="p-6 space-y-6">

        {/* Active range indicator */}
        <div className="p-4 bg-[#0a0a0f] border border-[#8b5cf6]/20">
          <div className="flex items-center gap-3">
            <Target className="w-4 h-4 text-[#8b5cf6]" />
            <div>
              <h2 className="text-xs font-bold text-[#8b5cf6] tracking-[0.15em] font-mono">INTERACTIVE_CYBER_RANGE</h2>
              <p className="text-[10px] text-[#333355] tracking-wider font-mono">REAL VULNERABLE SYSTEMS. REAL ATTACKS. SAFE, ISOLATED ENVIRONMENT.</p>
            </div>
            <div className="ml-auto flex items-center gap-4 text-[10px] font-mono tracking-wider">
              <div className="flex items-center gap-1.5 text-[#0a8a3e]">
                <Users className="w-3 h-3 text-[#8b5cf6]" />
                <span>2,847 ONLINE</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#00ff41] border border-[#00ff41]/20 px-3 py-1.5">
                <span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse" />
                RANGE_ONLINE
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Scenarios */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-[10px] font-bold text-[#333355] tracking-[0.2em] font-mono">ACTIVE_SCENARIOS</p>
            {scenarios.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-[#0a0a0f] border border-[#1a1a2e] p-4 cyber-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] text-[#333355] font-mono tracking-wider">MISSION_{String(s.id).padStart(2, '0')}</span>
                      {!s.active && <Lock className="w-3 h-3 text-[#333355]" />}
                    </div>
                    <h4 className="text-xs font-bold text-[#00ff41] tracking-[0.1em] font-mono">{s.title}</h4>
                  </div>
                  <Badge className={difficultyColor[s.difficulty]}>{s.difficulty}</Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {s.tags.map(tag => (
                    <span key={tag} className="text-[9px] px-2 py-0.5 bg-black text-[#0a8a3e] border border-[#1a1a2e] font-mono tracking-wider">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-[#333355] mb-3 font-mono tracking-wider">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {s.players.toLocaleString()} COMPLETED</span>
                  <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {s.duration}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-[#ffaa00]" /> {s.rating}</span>
                </div>
                <Button variant="primary" size="sm" disabled={!s.active || activeScenario === s.id}
                  onClick={() => startScenario(s.id)}>
                  {!s.active ? <>[ LOCKED ]</> :
                    activeScenario === s.id ? <><Zap className="w-2.5 h-2.5" /> [ RUNNING... ]</> :
                    <><Play className="w-2.5 h-2.5" /> [ LAUNCH ]</>}
                </Button>
              </motion.div>
            ))}

            {/* Live terminal */}
            {activeScenario && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse" />
                      <CardTitle>ENVIRONMENT_TERMINAL</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="font-mono text-[11px] space-y-1 bg-black p-4 min-h-[120px] tracking-wider">
                      {attackLog.map((log, i) => (
                        <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className={i === attackLog.length - 1 ? 'text-[#00ff41]' : 'text-[#0a8a3e]'}>
                          {i === attackLog.length - 1 ? '> ' : '✓ '}{log}
                        </motion.p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Leaderboard */}
          <div>
            <p className="text-[10px] font-bold text-[#333355] tracking-[0.2em] font-mono mb-3">LEADERBOARD</p>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-[#ffaa00]" />
                  <CardTitle>TOP OPERATORS</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((p) => (
                    <div key={p.rank} className="flex items-center gap-3 font-mono text-[11px]">
                      <span className={`w-4 text-center font-bold ${
                        p.rank === 1 ? 'text-[#ffaa00]' : p.rank === 2 ? 'text-[#00ff41]' : p.rank === 3 ? 'text-[#ff6600]' : 'text-[#333355]'
                      }`}>{String(p.rank).padStart(2, '0')}</span>
                      <span className="text-base">{p.country}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#00ff41] truncate tracking-wider">{p.username}</p>
                        <p className="text-[9px] text-[#333355] tracking-wider">{p.time}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#00ccff] tracking-wider">{p.score.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Score breakdown */}
            <Card className="mt-3">
              <CardHeader><CardTitle>SCORING_RULES</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1.5 text-[10px] font-mono">
                  {[
                    ['INITIAL_ACCESS', '+500 PTS'],
                    ['PRIVILEGE_ESCALATION', '+750 PTS'],
                    ['LATERAL_MOVEMENT', '+600 PTS'],
                    ['DATA_EXFILTRATION', '+1000 PTS'],
                    ['SPEED_BONUS', 'UP TO +500'],
                    ['HINT_PENALTY', '-100 PTS EACH'],
                  ].map(([action, pts]) => (
                    <div key={action} className="flex justify-between items-center tracking-wider">
                      <span className="text-[#0a8a3e]">{action}</span>
                      <span className="text-[#00ccff]">{pts}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
