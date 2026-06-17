'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, accessToken, fetchMe } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
      return;
    }
    if (!user) fetchMe();
  }, [accessToken, user, router, fetchMe]);

  if (!accessToken) return null;

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen flex flex-col pb-8">
        {children}
      </main>

      {/* Status bar — bottom HUD strip */}
      <footer className="fixed bottom-0 left-64 right-0 h-8 bg-[#0a0a0f] border-t border-[#1a1a2e] flex items-center justify-between px-6 z-50 font-mono text-[10px] tracking-wider">
        <div className="flex items-center gap-6">
          <span className="text-[#333355]">MEM_ALLOC: <span className="text-[#0a8a3e]">4096MB</span></span>
          <span className="text-[#333355]">UPTIME: <span className="text-[#00ff41]">99.999%</span></span>
          <span className="text-[#333355]">ENCRYPTION: <span className="text-[#0a8a3e]">RSA-4096</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse" />
          <span className="text-[#333355]">CONNECTION: <span className="text-[#00ff41]">SECURE</span></span>
        </div>
      </footer>
    </div>
  );
}
