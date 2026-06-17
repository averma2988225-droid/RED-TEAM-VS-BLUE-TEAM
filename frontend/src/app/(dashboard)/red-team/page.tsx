'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Swords, Play, Database, Code2, KeyRound, Search, FileWarning, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Simulation, Severity } from '@/types';
import { severityColor, formatRelative } from '@/lib/utils';
import api from '@/lib/api';

const ATTACK_MODULES = [
  { type: 'sql-injection', label: 'SQL_INJECTION', icon: Database, desc: 'Test for SQLi vulnerabilities using UNION, error-based, and blind injection techniques.', severity: 'CRITICAL' as Severity, hex: '0x1F4' },
  { type: 'xss', label: 'CROSS_SITE_SCRIPTING', icon: Code2, desc: 'Reflected and stored XSS payload injection with cookie stealing demonstrations.', severity: 'HIGH' as Severity, hex: '0x3E8' },
  { type: 'brute-force', label: 'PASSWORD_ATTACKS', icon: KeyRound, desc: 'Credential stuffing, password spraying, and dictionary-based brute force attacks.', severity: 'HIGH' as Severity, hex: '0x5DC' },
  { type: 'recon', label: 'RECONNAISSANCE', icon: Search, desc: 'DNS enumeration, port scanning, OS fingerprinting, and OSINT gathering.', severity: 'MEDIUM' as Severity, hex: '0x7D0' },
];

function SimulationCard({ sim }: { sim: Simulation }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-[#1a1a2e] overflow-hidden">
      <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#00ff41]/3 transition-colors font-mono text-[11px]" onClick={() => setExpanded(s => !s)}>
        <span className={`w-1.5 h-1.5 shrink-0 ${sim.status === 'COMPLETED' ? 'bg-[#00ff41]' : sim.status === 'RUNNING' ? 'bg-[#ffaa00] animate-pulse' : 'bg-[#333355]'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-[#00ff41] tracking-wider">{sim.title}</p>
          <p className="text-[9px] text-[#333355] tracking-wider">{formatRelative(sim.createdAt)}</p>
        </div>
        <span className="text-[10px] font-bold text-[#00ccff] mr-2 tracking-wider">+{sim.score} PTS</span>
        <ChevronRight className={`w-3 h-3 text-[#333355] transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </div>
      <AnimatePresence>
        {expanded && sim.findings && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 space-y-1">
              {(sim.findings as any[]).map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-2 bg-black/40 font-mono text-[10px]">
                  <span className="text-[#333355] shrink-0 tracking-wider">[{String(f.step).padStart(2, '0')}]</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#0a8a3e] tracking-wider">{f.action}</p>
                    <code className="text-[#00ff41] break-all tracking-wider">{f.payload}</code>
                  </div>
                  <Badge className={severityColor[f.severity as Severity]}>{f.severity}</Badge>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RedTeamPage() {
  const qc = useQueryClient();
  const [running, setRunning] = useState<string | null>(null);

  const { data: simulations = [] } = useQuery<Simulation[]>({
    queryKey: ['simulations'],
    queryFn: () => api.get('/simulations').then(r => r.data),
  });

  const { mutate: runSim } = useMutation({
    mutationFn: (type: string) => {
      const mod = ATTACK_MODULES.find(m => m.type === type)!;
      return api.post('/simulations', { type, title: mod.label + ' ATTACK', description: mod.desc });
    },
    onMutate: (type) => setRunning(type),
    onSuccess: () => {
      setRunning(null);
      setTimeout(() => qc.invalidateQueries({ queryKey: ['simulations'] }), 2500);
    },
    onError: () => setRunning(null),
  });

  return (
    <div className="flex flex-col flex-1">
      <Header title="RED TEAM OPERATIONS" subtitle="OFFENSIVE SECURITY SIMULATIONS AND ATTACK SCENARIOS" />
      <div className="p-6 space-y-6">

        {/* Header banner */}
        <div className="p-4 bg-[#0a0a0f] border border-[#ff0033]/20">
          <div className="flex items-center gap-3">
            <Swords className="w-4 h-4 text-[#ff0033]" />
            <div>
              <h2 className="text-xs font-bold text-[#ff0033] tracking-[0.15em] font-mono">OFFENSIVE_SECURITY_LAB</h2>
              <p className="text-[10px] text-[#333355] tracking-wider font-mono">SIMULATED ATTACKS IN ISOLATED ENVIRONMENT — SAFE, LEGAL, EDUCATIONAL</p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-[10px] text-[#ff0033] border border-[#ff0033]/20 px-3 py-1.5 font-mono tracking-wider">
              <span className="w-1.5 h-1.5 bg-[#ff0033] animate-pulse" />
              ENVIRONMENT: ISOLATED
            </div>
          </div>
        </div>

        {/* Attack modules */}
        <div>
          <p className="text-[10px] font-bold text-[#333355] mb-3 tracking-[0.2em] font-mono">ATTACK_MODULES</p>
          <div className="grid md:grid-cols-2 gap-3">
            {ATTACK_MODULES.map((mod, idx) => {
              const Icon = mod.icon;
              const isRunning = running === mod.type;
              return (
                <motion.div key={mod.type} whileHover={{ y: 0 }}
                  className="bg-[#0a0a0f] border border-[#ff0033]/15 p-4 cyber-card">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-[#333355] font-mono tracking-wider">{mod.hex} // NODE_{String(idx + 1).padStart(2, '0')}</span>
                    <Badge className={severityColor[mod.severity]}>{mod.severity}</Badge>
                  </div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-[#ff0033]" />
                      <p className="text-xs font-bold text-[#ff0033] tracking-[0.1em] font-mono">{mod.label}</p>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => runSim(mod.type)}
                      disabled={!!running}
                      isLoading={isRunning}
                    >
                      {!isRunning && <Play className="w-2.5 h-2.5" />}
                      [ EXECUTE ]
                    </Button>
                  </div>
                  <p className="text-[10px] text-[#0a8a3e] leading-relaxed tracking-wider font-mono normal-case">{mod.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Vulnerability reference */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileWarning className="w-3.5 h-3.5 text-[#ffaa00]" />
              <CardTitle>ATTACK REFERENCE — OWASP TOP 10</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-1">
              {[
                ['A01', 'BROKEN_ACCESS_CONTROL', 'CRITICAL'],
                ['A02', 'CRYPTOGRAPHIC_FAILURES', 'CRITICAL'],
                ['A03', 'INJECTION (SQLi, XSS)', 'CRITICAL'],
                ['A04', 'INSECURE_DESIGN', 'HIGH'],
                ['A05', 'SECURITY_MISCONFIGURATION', 'HIGH'],
                ['A06', 'VULNERABLE_COMPONENTS', 'HIGH'],
                ['A07', 'AUTH_SESSION_FAILURES', 'HIGH'],
                ['A08', 'SOFTWARE_INTEGRITY', 'MEDIUM'],
                ['A09', 'LOGGING_MONITOR_FAILURES', 'MEDIUM'],
                ['A10', 'SERVER_SIDE_REQUEST_FORGERY', 'HIGH'],
              ].map(([code, name, sev]) => (
                <div key={code} className="flex items-center gap-3 p-2 hover:bg-[#00ff41]/3 transition-colors font-mono text-[10px]">
                  <span className="text-[#333355] w-6 tracking-wider">{code}</span>
                  <span className="text-[#0a8a3e] flex-1 tracking-wider">{name}</span>
                  <Badge className={severityColor[sev as Severity]}>{sev}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Simulation history */}
        <div>
          <p className="text-[10px] font-bold text-[#333355] mb-3 tracking-[0.2em] font-mono">SIMULATION_HISTORY</p>
          {simulations.length > 0 ? (
            <div className="space-y-1">
              {simulations.slice(0, 10).map(sim => <SimulationCard key={sim.id} sim={sim} />)}
            </div>
          ) : (
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] p-12 text-center">
              <Swords className="w-8 h-8 text-[#333355] mx-auto mb-3" />
              <p className="text-[#333355] text-[11px] font-mono tracking-wider">NO SIMULATIONS YET. LAUNCH FIRST ATTACK ABOVE.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
