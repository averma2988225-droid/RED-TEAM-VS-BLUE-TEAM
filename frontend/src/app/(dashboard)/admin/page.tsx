'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Settings, Users, Shield, AlertTriangle, FileText, UserCheck, Ban, BarChart3 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/dashboard/stat-card';
import { User } from '@/types';
import { roleColor, formatDate, formatRelative } from '@/lib/utils';
import api from '@/lib/api';

interface AdminStats {
  users: number;
  simulations: number;
  alerts: number;
  challenges: number;
  activeUsers: number;
  criticalAlerts: number;
}

interface UsersResponse {
  users: User[];
  total: number;
}

export default function AdminPage() {
  const qc = useQueryClient();

  const { data: adminStats } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
  });

  const { data: usersData } = useQuery<UsersResponse>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then(r => r.data),
  });

  const { data: auditLogs } = useQuery<any[]>({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/admin/audit-logs').then(r => r.data),
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/users/${id}/status`, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const { mutate: changeRole } = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div className="flex flex-col flex-1">
      <Header title="ADMIN_PANEL" subtitle="PLATFORM MANAGEMENT AND SECURITY OVERSIGHT" />
      <div className="p-6 space-y-6">

        {/* Banner */}
        <div className="p-4 bg-[#0a0a0f] border border-[#8b5cf6]/20">
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-[#8b5cf6]" />
            <div>
              <h2 className="text-xs font-bold text-[#8b5cf6] tracking-[0.15em] font-mono">ADMINISTRATOR_CONSOLE</h2>
              <p className="text-[10px] text-[#333355] tracking-wider font-mono">FULL PLATFORM CONTROL — USER MANAGEMENT, AUDIT LOGS, ANALYTICS</p>
            </div>
            <Badge className="ml-auto text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/20">ADMIN</Badge>
          </div>
        </div>

        {/* Stats */}
        <div>
          <p className="text-[10px] font-bold text-[#333355] mb-3 tracking-[0.2em] font-mono">SYS_METRICS // PLATFORM_OVERVIEW</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { title: 'TOTAL_USERS', value: adminStats?.users ?? 0, icon: <Users className="w-3.5 h-3.5" />, color: 'text-[#00ccff]' },
              { title: 'ACTIVE_USERS', value: adminStats?.activeUsers ?? 0, icon: <UserCheck className="w-3.5 h-3.5" />, color: 'text-[#00ff41]' },
              { title: 'SIMULATIONS', value: adminStats?.simulations ?? 0, icon: <Shield className="w-3.5 h-3.5" />, color: 'text-[#ff0033]' },
              { title: 'TOTAL_ALERTS', value: adminStats?.alerts ?? 0, icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-[#ffaa00]' },
              { title: 'CRITICAL_ALERTS', value: adminStats?.criticalAlerts ?? 0, icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-[#ff0033]' },
              { title: 'CHALLENGES', value: adminStats?.challenges ?? 0, icon: <BarChart3 className="w-3.5 h-3.5" />, color: 'text-[#8b5cf6]' },
            ].map(s => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* User management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#00ccff]" />
                <CardTitle>USER_MANAGEMENT</CardTitle>
                <span className="text-[9px] text-[#333355] ml-auto font-mono tracking-wider">{usersData?.total ?? 0} TOTAL</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {(usersData?.users || []).map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-2.5 hover:bg-[#00ff41]/3 transition-colors font-mono">
                    <span className="w-6 h-6 bg-black border border-[#1a1a2e] flex items-center justify-center text-[10px] font-bold text-[#00ff41] shrink-0 tracking-wider">
                      {user.username[0].toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-[#00ff41] truncate tracking-wider">{user.username}</p>
                      <p className="text-[9px] text-[#333355] truncate tracking-wider">{user.email}</p>
                    </div>
                    <Badge className={roleColor[user.role]}>{user.role.replace('_', ' ')}</Badge>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changeRole({ id: user.id, role: user.role === 'STUDENT' ? 'RED_TEAM' : 'STUDENT' })}
                        className="p-1 text-[#333355] hover:text-[#00ccff] transition-colors"
                        title="Toggle role"
                      >
                        <UserCheck className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => toggleStatus({ id: user.id, isActive: !user.isActive })}
                        className={`p-1 transition-colors ${user.isActive ? 'text-[#333355] hover:text-[#ff0033]' : 'text-[#ff0033] hover:text-[#333355]'}`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Ban className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Audit log */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#ffaa00]" />
                <CardTitle>AUDIT_LOG</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-0 max-h-80 overflow-y-auto font-mono">
                {(auditLogs || []).slice(0, 20).map((log: any, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 text-[10px] hover:bg-[#00ff41]/3 transition-colors border-b border-[#1a1a2e]/50 tracking-wider">
                    <span className={`shrink-0 font-bold px-1.5 py-0.5 border text-[9px] ${
                      log.action === 'DELETE' ? 'text-[#ff0033] border-[#ff0033]/20 bg-[#ff0033]/5' :
                      log.action === 'POST' ? 'text-[#00ff41] border-[#00ff41]/20 bg-[#00ff41]/5' :
                      'text-[#ffaa00] border-[#ffaa00]/20 bg-[#ffaa00]/5'
                    }`}>{log.action}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#0a8a3e] truncate">{log.resource}</p>
                      <p className="text-[#333355]">{log.user?.username || 'ANONYMOUS'} // {formatRelative(log.createdAt)}</p>
                    </div>
                    {log.ipAddress && <span className="text-[#333355] shrink-0 font-mono">{log.ipAddress}</span>}
                  </div>
                ))}
                {(!auditLogs || auditLogs.length === 0) && (
                  <p className="text-[11px] text-[#333355] text-center py-8 font-mono tracking-wider">NO AUDIT LOGS RECORDED YET.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
