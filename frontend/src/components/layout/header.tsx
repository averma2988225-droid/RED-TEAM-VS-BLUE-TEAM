'use client';

import { Bell, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { scoreToGrade } from '@/lib/utils';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuthStore();
  const grade = user ? scoreToGrade(user.securityScore) : null;

  return (
    <header className="h-14 bg-[#0a0a0f] border-b border-[#1a1a2e] flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h1 className="text-xs font-bold text-[#00ff41] tracking-[0.2em] uppercase leading-none">// {title}</h1>
        {subtitle && <p className="text-[10px] text-[#333355] mt-0.5 tracking-wider font-mono">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Security score */}
        {grade && user?.securityScore !== undefined && (
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-wider">
            <Shield className="w-3 h-3 text-[#0a8a3e]" />
            <span className="text-[#333355]">SCORE:</span>
            <span className="text-[#00ff41] font-bold">{user.securityScore.toLocaleString()}</span>
            <span className="text-[#333355]">//</span>
            <span className="text-[#00ff41]">RANK: {grade.grade}</span>
          </div>
        )}

        {user && (
          <span className="text-[10px] font-mono tracking-wider text-[#0a8a3e] border border-[#1a1a2e] px-2 py-1">
            [ {user.role.replace('_', ' ')} ]
          </span>
        )}

        <button className="relative flex items-center gap-1 text-[10px] font-mono tracking-wider text-[#ffaa00] border border-[#1a1a2e] px-2 py-1 hover:border-[#ffaa00]/40 transition-colors">
          <Bell className="w-3 h-3" />
          <span>! 3 ALERTS</span>
        </button>
      </div>
    </header>
  );
}
