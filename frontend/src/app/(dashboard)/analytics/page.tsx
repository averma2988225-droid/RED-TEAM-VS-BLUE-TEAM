'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Globe, Activity } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';

const SEVERITY_COLORS: Record<string, string> = { CRITICAL: '#ff0033', HIGH: '#ff6600', MEDIUM: '#ffaa00', LOW: '#00ff41' };
const TYPE_COLORS = ['#00ccff', '#ff0033', '#8b5cf6', '#00ff41', '#ffaa00'];

const weeklyData = [
  { day: 'MON', attacks: 12, defenses: 15, resolved: 10 },
  { day: 'TUE', attacks: 18, defenses: 14, resolved: 16 },
  { day: 'WED', attacks: 9, defenses: 20, resolved: 18 },
  { day: 'THU', attacks: 25, defenses: 22, resolved: 20 },
  { day: 'FRI', attacks: 15, defenses: 18, resolved: 14 },
  { day: 'SAT', attacks: 30, defenses: 28, resolved: 26 },
  { day: 'SUN', attacks: 20, defenses: 25, resolved: 22 },
];

const skillsData = [
  { skill: 'RECON', A: 85, fullMark: 100 },
  { skill: 'EXPLOIT', A: 72, fullMark: 100 },
  { skill: 'PERSIST', A: 60, fullMark: 100 },
  { skill: 'DEFENSE', A: 90, fullMark: 100 },
  { skill: 'FORENSIC', A: 65, fullMark: 100 },
  { skill: 'CRYPTO', A: 55, fullMark: 100 },
];

export default function AnalyticsPage() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then(r => r.data),
  });

  const pieData = stats?.alertsBySeverity?.map(a => ({
    name: a.severity,
    value: a._count,
  })) || [
    { name: 'CRITICAL', value: 8 },
    { name: 'HIGH', value: 15 },
    { name: 'MEDIUM', value: 22 },
    { name: 'LOW', value: 31 },
  ];

  const simTypeData = stats?.simsByType?.map(s => ({ type: s.type.toUpperCase().replace(/-/g, '_'), count: s._count })) || [
    { type: 'SQL_INJECTION', count: 12 },
    { type: 'XSS', count: 8 },
    { type: 'BRUTE_FORCE', count: 6 },
    { type: 'RECON', count: 15 },
  ];

  const tooltipStyle = { background: '#0a0a0f', border: '1px solid #1a1a2e', color: '#00ff41', fontFamily: 'monospace', fontSize: 10 };
  const tickStyle = { fill: '#333355', fontSize: 10, fontFamily: 'monospace' };

  return (
    <div className="flex flex-col flex-1">
      <Header title="ANALYTICS" subtitle="PERFORMANCE METRICS AND SECURITY INTELLIGENCE" />
      <div className="p-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'DETECTION_RATE', value: '94.2%', change: '+2.1%', positive: true, icon: Activity },
            { label: 'MEAN_TIME_DETECT', value: '4.3 MIN', change: '-1.2 MIN', positive: true, icon: TrendingUp },
            { label: 'MEAN_TIME_RESPOND', value: '12.7 MIN', change: '+0.8 MIN', positive: false, icon: BarChart3 },
            { label: 'FALSE_POSITIVE_RATE', value: '3.8%', change: '-0.5%', positive: true, icon: Globe },
          ].map(kpi => {
            const Icon = kpi.icon;
            return (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0a0f] border border-[#1a1a2e] p-4 cyber-card font-mono">
                <Icon className="w-3.5 h-3.5 text-[#0a8a3e] mb-2 opacity-50" />
                <p className="text-xl font-bold text-[#00ff41] tracking-wider">{kpi.value}</p>
                <p className="text-[9px] text-[#333355] mt-0.5 tracking-[0.15em]">{kpi.label}</p>
                <span className={`text-[10px] tracking-wider ${kpi.positive ? 'text-[#00ff41]' : 'text-[#ff0033]'}`}>
                  {kpi.change}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Weekly activity */}
          <Card>
            <CardHeader><CardTitle>WEEKLY ATTACK VS DEFENSE</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" stroke="#1a1a2e" tick={tickStyle} />
                  <YAxis stroke="#1a1a2e" tick={tickStyle} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: '#333355', fontSize: 10, fontFamily: 'monospace' }} />
                  <Bar dataKey="attacks" fill="#ff0033" radius={[0, 0, 0, 0]} opacity={0.7} />
                  <Bar dataKey="defenses" fill="#00ccff" radius={[0, 0, 0, 0]} opacity={0.7} />
                  <Bar dataKey="resolved" fill="#00ff41" radius={[0, 0, 0, 0]} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Alert severity pie */}
          <Card>
            <CardHeader><CardTitle>ALERT SEVERITY DISTRIBUTION</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={SEVERITY_COLORS[entry.name] || TYPE_COLORS[i % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ color: '#333355', fontSize: 10, fontFamily: 'monospace' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Skill radar */}
          <Card>
            <CardHeader><CardTitle>OPERATOR SKILL PROFILE</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={skillsData}>
                  <PolarGrid stroke="#1a1a2e" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#333355', fontSize: 10, fontFamily: 'monospace' }} />
                  <Radar name="SCORE" dataKey="A" stroke="#00ff41" fill="#00ff41" fillOpacity={0.1} strokeWidth={1.5} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Simulation types */}
          <Card>
            <CardHeader><CardTitle>SIMULATIONS BY ATTACK TYPE</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={simTypeData} layout="vertical">
                  <XAxis type="number" stroke="#1a1a2e" tick={tickStyle} />
                  <YAxis type="category" dataKey="type" stroke="#1a1a2e" tick={tickStyle} width={120} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[0, 0, 0, 0]} opacity={0.7}>
                    {simTypeData.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Threat heatmap */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#00ccff]" />
              <CardTitle>ATTACK ORIGIN HEATMAP (SIMULATED)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-0.5">
              {Array.from({ length: 84 }, (_, i) => {
                const intensity = Math.random();
                return (
                  <div key={i} className="h-5 transition-all hover:opacity-80"
                    style={{ background: `rgba(0, 255, 65, ${intensity * 0.6 + 0.05})` }}
                    title={`${Math.round(intensity * 100)} attacks`}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[9px] text-[#333355] font-mono tracking-wider">LOW</span>
              <div className="flex gap-0 flex-1">
                {[0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 1.0].map(o => (
                  <div key={o} className="h-2 flex-1" style={{ background: `rgba(0, 255, 65, ${o})` }} />
                ))}
              </div>
              <span className="text-[9px] text-[#333355] font-mono tracking-wider">HIGH</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
