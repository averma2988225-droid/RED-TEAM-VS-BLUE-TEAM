'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, AlertTriangle, CheckCircle2, Activity, Filter, Eye, Lock } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, Severity } from '@/types';
import { severityColor, severityDot, formatRelative } from '@/lib/utils';
import api from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockLogEntries = [
  { time: '14:23:45', level: 'CRIT', source: 'WAF', message: 'SQLi blocked from 192.168.1.100 → /api/users' },
  { time: '14:23:31', level: 'WARN', source: 'IDS', message: 'Port scan detected from 10.0.0.15' },
  { time: '14:22:57', level: 'CRIT', source: 'AUTH', message: '50 failed login attempts — admin@target.com' },
  { time: '14:22:14', level: 'INFO', source: 'WAF', message: 'XSS payload sanitized in search endpoint' },
  { time: '14:21:30', level: 'WARN', source: 'SIEM', message: 'Unusual data exfil volume from user-service' },
  { time: '14:20:45', level: 'INFO', source: 'AUTH', message: 'New JWT issued for admin@cyberrange.io' },
  { time: '14:19:12', level: 'CRIT', source: 'FW', message: 'SSRF attempt to cloud metadata blocked' },
];

const threatData = [
  { hour: '08:00', threats: 2 }, { hour: '09:00', threats: 5 }, { hour: '10:00', threats: 3 },
  { hour: '11:00', threats: 8 }, { hour: '12:00', threats: 4 }, { hour: '13:00', threats: 11 },
  { hour: '14:00', threats: 7 }, { hour: '15:00', threats: 6 },
];

export default function BlueTeamPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>('all');

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: () => api.get('/alerts').then(r => r.data),
  });

  const { mutate: resolveAlert } = useMutation({
    mutationFn: (id: string) => api.patch(`/alerts/${id}/resolve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const filtered = filter === 'all' ? alerts : filter === 'unresolved' ? alerts.filter(a => !a.isResolved) : alerts.filter(a => a.severity === filter);

  const sevCounts = (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as Severity[]).map(s => ({
    label: s,
    count: alerts.filter(a => a.severity === s && !a.isResolved).length,
  }));

  return (
    <div className="flex flex-col flex-1">
      <Header title="BLUE TEAM DEFENSE" subtitle="THREAT DETECTION, MONITORING, AND INCIDENT RESPONSE" />
      <div className="p-6 space-y-6">

        {/* Banner */}
        <div className="p-4 bg-[#0a0a0f] border border-[#00ccff]/20">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-[#00ccff]" />
            <div>
              <h2 className="text-xs font-bold text-[#00ccff] tracking-[0.15em] font-mono">SECURITY_OPERATIONS_CENTER</h2>
              <p className="text-[10px] text-[#333355] tracking-wider font-mono">MONITOR, DETECT, AND RESPOND TO THREATS IN REAL TIME</p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-[10px] text-[#00ccff] border border-[#00ccff]/20 px-3 py-1.5 font-mono tracking-wider">
              <Activity className="w-3 h-3" />
              {alerts.filter(a => !a.isResolved).length} ACTIVE_INCIDENTS
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Severity counts */}
          <div className="space-y-2">
            {sevCounts.map(({ label, count }) => (
              <div key={label} className={`bg-[#0a0a0f] border p-3 flex items-center gap-3 font-mono ${severityColor[label as Severity]}`}>
                <span className={`w-2 h-2 ${severityDot[label as Severity]}`} />
                <div className="flex-1">
                  <p className="text-[9px] tracking-[0.15em] opacity-60">{label}</p>
                  <p className="text-lg font-bold text-[#00ff41]">{count}</p>
                </div>
                <AlertTriangle className="w-3.5 h-3.5 opacity-40" />
              </div>
            ))}
          </div>

          {/* Threat timeline */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader><CardTitle>THREAT_ACTIVITY (TODAY)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={threatData}>
                    <XAxis dataKey="hour" stroke="#1a1a2e" tick={{ fill: '#333355', fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis stroke="#1a1a2e" tick={{ fill: '#333355', fontSize: 10, fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ background: '#0a0a0f', border: '1px solid #1a1a2e', color: '#00ff41', fontFamily: 'monospace', fontSize: 11 }} />
                    <Bar dataKey="threats" fill="#00ccff" radius={[0, 0, 0, 0]} opacity={0.7} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live log */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-[#00ff41]" />
                <CardTitle>SIEM LOG STREAM</CardTitle>
                <span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse" />
              </div>
              <span className="text-[9px] text-[#0a8a3e] font-mono tracking-wider">LIVE</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 font-mono text-[10px] max-h-48 overflow-y-auto">
              {mockLogEntries.map((log, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 py-1.5 border-b border-[#1a1a2e]/50 tracking-wider">
                  <span className="text-[#333355] shrink-0">{log.time}</span>
                  <span className={`shrink-0 w-10 text-center font-bold ${
                    log.level === 'CRIT' ? 'text-[#ff0033]' : log.level === 'WARN' ? 'text-[#ffaa00]' : 'text-[#00ff41]'
                  }`}>{log.level}</span>
                  <span className="text-[#00ccff] shrink-0 w-10">{log.source}</span>
                  <span className="text-[#0a8a3e] normal-case">{log.message}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert management */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-[#333355] tracking-[0.2em] font-mono">ALERT_MANAGEMENT</p>
            <div className="flex items-center gap-2">
              <Filter className="w-3 h-3 text-[#333355]" />
              {['all', 'unresolved', 'CRITICAL', 'HIGH'].map(f => (
                <button key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[10px] px-3 py-1 font-mono tracking-wider transition-all ${filter === f ? 'bg-[#00ff41]/10 text-[#00ff41] border border-[#00ff41]/30' : 'text-[#333355] hover:text-[#0a8a3e] border border-transparent'}`}>
                  {f === 'all' ? 'ALL' : f === 'unresolved' ? 'OPEN' : f}
                </button>
              ))}
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-1">
              {filtered.map(alert => (
                <div key={alert.id} className={`bg-[#0a0a0f] border p-3 flex items-center gap-4 font-mono ${alert.isResolved ? 'opacity-40 border-[#1a1a2e]' : 'border-[#1a1a2e]'}`}>
                  <span className={`w-2 h-2 shrink-0 ${severityDot[alert.severity]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[11px] font-bold text-[#00ff41] tracking-wider">{alert.title}</p>
                      <Badge className={severityColor[alert.severity]}>{alert.severity}</Badge>
                    </div>
                    <p className="text-[10px] text-[#0a8a3e] tracking-wider normal-case">{alert.description}</p>
                    <p className="text-[9px] text-[#333355] mt-1 tracking-wider">{alert.source} // {formatRelative(alert.createdAt)}</p>
                  </div>
                  {!alert.isResolved && (
                    <Button variant="success" size="sm" onClick={() => resolveAlert(alert.id)}>
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      [ RESOLVE ]
                    </Button>
                  )}
                  {alert.isResolved && <span className="text-[10px] text-[#00ff41] font-mono tracking-wider">[RESOLVED]</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] p-12 text-center">
              <Shield className="w-8 h-8 text-[#0a8a3e]/30 mx-auto mb-3" />
              <p className="text-[#333355] text-[11px] font-mono tracking-wider">NO ALERTS FOUND. DEFENSES HOLDING.</p>
            </div>
          )}
        </div>

        {/* Defense controls */}
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { icon: Lock, label: 'WAF_RULES', status: 'ACTIVE', count: '247 RULES', color: 'text-[#00ccff]' },
            { icon: Eye, label: 'IDS/IPS', status: 'MONITORING', count: '12 SIGNATURES', color: 'text-[#8b5cf6]' },
            { icon: Shield, label: 'FIREWALL', status: 'ACTIVE', count: '98 POLICIES', color: 'text-[#00ff41]' },
          ].map(ctrl => {
            const Icon = ctrl.icon;
            return (
              <div key={ctrl.label} className="bg-[#0a0a0f] border border-[#1a1a2e] p-3 flex items-center gap-3 font-mono">
                <Icon className={`w-5 h-5 ${ctrl.color} opacity-50`} />
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-[#00ff41] tracking-wider">{ctrl.label}</p>
                  <p className="text-[9px] text-[#333355] tracking-wider">{ctrl.count}</p>
                </div>
                <span className="text-[9px] text-[#00ff41] border border-[#00ff41]/20 px-2 py-0.5 tracking-wider">{ctrl.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
