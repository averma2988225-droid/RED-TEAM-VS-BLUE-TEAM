'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Target, CheckCircle2, Star, Trophy, Send } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Challenge } from '@/types';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const difficultyColor: Record<string, string> = {
  Easy: 'text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/20',
  Medium: 'text-[#ffaa00] bg-[#ffaa00]/10 border-[#ffaa00]/20',
  Hard: 'text-[#ff6600] bg-[#ff6600]/10 border-[#ff6600]/20',
  Expert: 'text-[#ff0033] bg-[#ff0033]/10 border-[#ff0033]/20',
};

const CATEGORIES = ['All', 'Web Security', 'Binary Exploitation', 'Authentication', 'CVE Exploits'];

const LEARNING_PATHS = [
  { title: 'WEB_SECURITY_FUNDAMENTALS', lessons: 12, progress: 75, color: '#00ccff' },
  { title: 'NETWORK_PENETRATION_TESTING', lessons: 8, progress: 40, color: '#8b5cf6' },
  { title: 'MALWARE_ANALYSIS', lessons: 15, progress: 20, color: '#ff0033' },
  { title: 'CLOUD_SECURITY', lessons: 10, progress: 0, color: '#00ff41' },
];

export default function LearningPage() {
  const qc = useQueryClient();
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<{ correct: boolean } | null>(null);
  const [category, setCategory] = useState('All');

  const { data: challenges = [] } = useQuery<Challenge[]>({
    queryKey: ['challenges'],
    queryFn: () => api.get('/challenges').then(r => r.data),
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () => api.post(`/challenges/${activeChallenge!.id}/submit`, { answer }),
    onSuccess: (res) => {
      setResult(res.data);
      if (res.data.correct) qc.invalidateQueries({ queryKey: ['challenges'] });
    },
  });

  const filtered = category === 'All' ? challenges : challenges.filter(c => c.category === category);
  const solved = challenges.filter(c => c.progress?.isCompleted).length;
  const totalPoints = challenges.filter(c => c.progress?.isCompleted).reduce((s, c) => s + c.points, 0);

  const asciiBar = (pct: number) => {
    const filled = Math.round(pct / 5);
    return '█'.repeat(filled) + '░'.repeat(20 - filled);
  };

  return (
    <div className="flex flex-col flex-1">
      <Header title="TRAINING LAB" subtitle="CHALLENGES, LABS, AND CERTIFICATION PATHS" />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'CHALLENGES', value: challenges.length, icon: Target, color: 'text-[#00ccff]' },
            { label: 'SOLVED', value: solved, icon: CheckCircle2, color: 'text-[#00ff41]' },
            { label: 'TOTAL_POINTS', value: totalPoints, icon: Trophy, color: 'text-[#ffaa00]' },
            { label: 'COMPLETION', value: `${challenges.length ? Math.round((solved / challenges.length) * 100) : 0}%`, icon: Star, color: 'text-[#8b5cf6]' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-[#0a0a0f] border border-[#1a1a2e] p-3 font-mono">
                <Icon className={`w-3.5 h-3.5 ${stat.color} mb-2 opacity-50`} />
                <p className="text-lg font-bold text-[#00ff41] tracking-wider">{stat.value}</p>
                <p className="text-[9px] text-[#333355] tracking-[0.15em]">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Learning paths */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#00ccff]" />
              <CardTitle>LEARNING_PATHS</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {LEARNING_PATHS.map(path => (
                <div key={path.title} className="p-3 bg-black border border-[#1a1a2e] hover:border-[#1a1a2e] transition-colors font-mono">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-[#00ff41] tracking-wider">{path.title}</p>
                    <span className="text-[9px] text-[#333355] tracking-wider">{path.lessons} LESSONS</span>
                  </div>
                  <div className="text-[10px] tracking-[0.15em] mb-1">
                    <span style={{ color: path.color }}>{asciiBar(path.progress)}</span>
                  </div>
                  <p className="text-[9px] text-[#333355] tracking-wider">{path.progress}% COMPLETE</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Challenge list */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`text-[10px] px-3 py-1.5 font-mono tracking-wider transition-all ${category === cat ? 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30' : 'text-[#333355] border border-[#1a1a2e] hover:border-[#1a1a2e] hover:text-[#0a8a3e]'}`}>
                  {cat.toUpperCase().replace(/ /g, '_')}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              {filtered.map((ch, i) => (
                <motion.div key={ch.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => { setActiveChallenge(ch); setAnswer(''); setResult(null); }}
                  className={cn(
                    'bg-[#0a0a0f] border p-3 cursor-pointer transition-all font-mono',
                    activeChallenge?.id === ch.id ? 'border-[#00ff41]/30 bg-[#00ff41]/3' : 'border-[#1a1a2e] hover:border-[#1a1a2e]',
                    ch.progress?.isCompleted && 'border-[#00ff41]/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {ch.progress?.isCompleted ? (
                      <span className="text-[#00ff41] text-[11px] shrink-0">[x]</span>
                    ) : (
                      <span className="text-[#333355] text-[11px] shrink-0">[ ]</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#00ff41] tracking-wider">{ch.title}</p>
                      <p className="text-[9px] text-[#333355] tracking-wider">{ch.category}</p>
                    </div>
                    <Badge className={difficultyColor[ch.difficulty]}>{ch.difficulty}</Badge>
                    <span className="text-[10px] font-bold text-[#ffaa00] shrink-0 tracking-wider">{ch.points} PTS</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Challenge detail */}
          <div>
            {activeChallenge ? (
              <Card className="sticky top-20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{activeChallenge.title}</CardTitle>
                    <Badge className={difficultyColor[activeChallenge.difficulty]}>{activeChallenge.difficulty}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[11px] text-[#0a8a3e] leading-relaxed tracking-wider font-mono normal-case">{activeChallenge.description}</p>
                  <div className="p-3 bg-black border border-[#1a1a2e]">
                    <p className="text-[9px] text-[#333355] mb-1 tracking-[0.15em] font-mono">OBJECTIVE</p>
                    <p className="text-[11px] text-[#00ff41] font-mono tracking-wider normal-case">{activeChallenge.content}</p>
                  </div>

                  {result ? (
                    <div className={`p-3 border font-mono text-[11px] tracking-wider ${result.correct ? 'bg-[#00ff41]/5 border-[#00ff41]/20 text-[#00ff41]' : 'bg-[#ff0033]/5 border-[#ff0033]/20 text-[#ff0033]'}`}>
                      {result.correct ? '[+] CORRECT. FLAG ACCEPTED.' : '[!] INCORRECT. RETRY.'}
                    </div>
                  ) : activeChallenge.progress?.isCompleted ? (
                    <div className="p-3 bg-[#00ff41]/5 border border-[#00ff41]/20 text-[#00ff41] text-[11px] font-mono tracking-wider">
                      [+] SOLVED — {activeChallenge.points} PTS EARNED
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Input label="FLAG_INPUT" placeholder="Submit your flag or answer..."
                        value={answer} onChange={e => setAnswer(e.target.value)} />
                      <Button className="w-full" onClick={() => submit()} isLoading={isPending} disabled={!answer}>
                        <Send className="w-3 h-3" />
                        [ SUBMIT_FLAG ]
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="bg-[#0a0a0f] border border-[#1a1a2e] p-8 text-center">
                <Target className="w-6 h-6 text-[#333355] mx-auto mb-2" />
                <p className="text-[11px] text-[#333355] font-mono tracking-wider">SELECT_CHALLENGE_TO_VIEW</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
