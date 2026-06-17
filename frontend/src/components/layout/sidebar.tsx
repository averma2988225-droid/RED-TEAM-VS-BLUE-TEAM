'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield, Swords, BookOpen, BarChart3, Settings,
  LogOut, Target, Home, Code2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/dashboard', label: 'OVERVIEW', icon: Home },
  { href: '/red-team', label: 'RED_TEAM_OPS', icon: Swords, color: 'text-[#ff0033]' },
  { href: '/blue-team', label: 'BLUE_TEAM_DEF', icon: Shield, color: 'text-[#00ccff]' },
  { href: '/cyber-range', label: 'CYBER_RANGE', icon: Target, color: 'text-[#8b5cf6]' },
  { href: '/learning', label: 'TRAINING_LAB', icon: BookOpen, color: 'text-[#00ff41]' },
  { href: '/analytics', label: 'ANALYTICS', icon: BarChart3 },
  { href: '/admin', label: 'ADMIN_PANEL', icon: Settings, adminOnly: true },
];

const redTeamSubItems = [
  { href: '/red-team/scanner', label: 'CODE_SCANNER', icon: Code2, color: 'text-[#00ccff]' },
];

const BOOT_LINES = [
  { addr: '0x0000', msg: 'INITIALIZING KERNEL... [OK]' },
  { addr: '0x0004', msg: 'LOADING SECURITY_MODULES... [OK]' },
  { addr: '0x0008', msg: 'MOUNTING /DEV/CYBERRANGE... [OK]' },
  { addr: '0x000C', msg: 'ESTABLISHING SECURE_SOCKET... [OK]' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const visibleItems = navItems.filter(item => !item.adminOnly || user?.role === 'ADMIN');

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#0a0a0f] border-r border-[#1a1a2e] flex flex-col z-50">
      {/* Logo / Header */}
      <div className="p-4 border-b border-[#1a1a2e]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-[#00ff41] text-lg font-bold tracking-wider">╔═╗</span>
          <div>
            <p className="text-xs font-bold text-[#00ff41] tracking-[0.2em] leading-none">CYBERRANGE</p>
            <p className="text-[10px] text-[#333355] tracking-[0.15em] mt-0.5">| TACTICAL_PLATFORM</p>
          </div>
        </Link>
      </div>

      {/* Boot sequence */}
      <div className="px-4 py-3 border-b border-[#1a1a2e]">
        {BOOT_LINES.map(line => (
          <div key={line.addr} className="flex items-start gap-2 text-[9px] leading-relaxed">
            <span className="text-[#333355] shrink-0 font-mono">{line.addr}</span>
            <span className="text-[#0a8a3e] font-mono">{line.msg}</span>
          </div>
        ))}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] text-[#333355] tracking-[0.2em] px-2 mb-2 font-mono">SYS_NAV :: MODULES</p>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <div key={item.href}>
              <Link href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-2.5 px-2 py-2 text-xs font-mono tracking-wider transition-all',
                    active
                      ? 'text-[#00ff41] bg-[#00ff41]/5 border-l-2 border-[#00ff41]'
                      : 'text-[#0a8a3e] hover:text-[#00ff41] hover:bg-[#00ff41]/3 border-l-2 border-transparent'
                  )}
                >
                  <span className="text-[10px] shrink-0">{active ? '>' : '+'}</span>
                  <Icon className={cn('w-3.5 h-3.5 shrink-0', active ? 'text-[#00ff41]' : item.color || 'text-[#333355]')} />
                  <span className="truncate">{item.label}</span>
                </div>
              </Link>

              {item.href === '/red-team' && (
                <div className="mt-0.5 ml-5 space-y-0.5">
                  {redTeamSubItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const subActive = pathname === subItem.href || pathname.startsWith(subItem.href + '/');

                    return (
                      <Link key={subItem.href} href={subItem.href}>
                        <div
                          className={cn(
                            'flex items-center gap-2 px-2 py-1.5 text-[10px] font-mono tracking-wider transition-all border-l border-transparent',
                            subActive
                              ? 'text-[#00ccff] bg-[#00ccff]/5 border-l-[#00ccff]'
                              : 'text-[#0a8a3e] hover:text-[#00ccff] hover:bg-[#00ccff]/3'
                          )}
                        >
                          <span className="text-[9px] shrink-0">{subActive ? '>' : '+'}</span>
                          <SubIcon className={cn('w-3 h-3 shrink-0', subActive ? 'text-[#00ccff]' : subItem.color)} />
                          <span className="truncate">{subItem.label}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* System status */}
      <div className="px-4 mb-2">
        <div className="flex items-center gap-2 px-2 py-2 border border-[#1a1a2e] bg-black">
          <span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse" />
          <span className="text-[10px] text-[#00ff41] font-mono tracking-[0.15em]">SYS_STATUS: ONLINE</span>
        </div>
      </div>

      {/* User / Operator */}
      <div className="p-4 border-t border-[#1a1a2e]">
        <div className="mb-3 text-[10px] font-mono">
          <div className="flex items-center gap-2 text-[#0a8a3e]">
            <span className="text-[#333355]">OPERATOR:</span>
            <span className="text-[#00ff41] truncate">{user?.username}</span>
          </div>
          <div className="flex items-center gap-2 text-[#0a8a3e] mt-0.5">
            <span className="text-[#333355]">ROLE:</span>
            <span className="text-[#00ff41]">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-[#ff0033] border border-[#ff0033]/20 hover:border-[#ff0033]/50 hover:bg-[#ff0033]/5 transition-all font-mono tracking-wider uppercase"
        >
          <LogOut className="w-3 h-3" />
          [ DISCONNECT ]
        </button>
      </div>
    </aside>
  );
}
