'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Book, Terminal, Shield, Zap, Code, Database, ChevronRight, Activity } from 'lucide-react';

const docCategories = [
  {
    title: 'GETTING_STARTED',
    icon: Terminal,
    links: ['Platform Overview', 'Environment Setup', 'First Simulation', 'Authentication']
  },
  {
    title: 'RED_TEAM_OPERATIONS',
    icon: Zap,
    links: ['Available Scenarios', 'Attack Vectors', 'Tool Integration', 'Scoring System']
  },
  {
    title: 'BLUE_TEAM_DEFENSE',
    icon: Shield,
    links: ['SIEM Configuration', 'Log Analysis', 'Incident Response', 'Defense Metrics']
  },
  {
    title: 'API_REFERENCE',
    icon: Code,
    links: ['REST Endpoints', 'WebSocket Feeds', 'Authentication tokens', 'Rate Limits']
  }
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black font-mono overflow-x-hidden flex flex-col">
      {/* Navbar Minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 border-b border-[#1a1a2e]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#00ff41] font-bold tracking-[0.2em] text-sm">[ CYBERRANGE ]</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[10px] text-[#0a8a3e] hover:text-[#00ff41] transition-colors tracking-[0.15em] font-mono">SIGN_IN</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-28 pb-20 px-6 max-w-7xl mx-auto w-full relative grid md:grid-cols-[250px_1fr] gap-12">
        {/* Sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-28 space-y-8">
            {docCategories.map((cat, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-3">
                  <cat.icon className="w-4 h-4 text-[#00ff41]" />
                  <h3 className="text-[10px] font-bold text-[#00ff41] tracking-[0.15em]">{cat.title}</h3>
                </div>
                <ul className="space-y-2 border-l border-[#1a1a2e] ml-2 pl-3">
                  {cat.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-[10px] text-[#0a8a3e] hover:text-[#00ff41] transition-colors tracking-wider flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 opacity-50" />
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-8 text-[10px] font-mono tracking-[0.15em]">
            <span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse" />
            <span className="text-[#0a8a3e]">MANUAL: V_2.0.4</span>
            <span className="text-[#333355]">//</span>
            <span className="text-[#0a8a3e]">INDEX</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-5xl font-black text-[#00ff41] mb-6 tracking-wider" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.3)' }}>
              DOCUMENTATION
            </h1>
            <p className="text-[#0a8a3e] text-xs leading-relaxed tracking-wider mb-12">
              WELCOME TO THE CYBERRANGE OPERATIONAL MANUAL. HERE YOU WILL FIND DETAILED SPECIFICATIONS,
              INTEGRATION GUIDES, AND SCENARIO WALKTHROUGHS TO MAXIMIZE YOUR SIMULATION EFFECTIVENESS.
            </p>

            <div className="bg-[#0a0a0f] border border-[#1a1a2e] p-6 mb-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#ffaa00]" />
              <h2 className="text-sm font-bold text-[#ffaa00] mb-3 tracking-[0.1em] flex items-center gap-2">
                <Activity className="w-4 h-4" />
                SYSTEM_NOTICE
              </h2>
              <p className="text-[11px] text-[#0a8a3e] tracking-wider leading-relaxed">
                THE PLATFORM IS CURRENTLY OPERATING IN <span className="text-[#ffaa00]">BETA</span>. 
                CERTAIN ADVANCED ATTACK VECTORS AND HEURISTIC DEFENSE MECHANISMS MAY BE DEPLOYED 
                WITHOUT PRIOR NOTICE IN THE CHNGLOG. STAY VIGILANT.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {docCategories.map((cat, i) => (
                <div key={i} className="bg-[#0a0a0f] border border-[#1a1a2e] p-5 hover:border-[#00ff41]/30 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#00ff41]/5 border border-[#00ff41]/20 group-hover:bg-[#00ff41]/10 transition-colors">
                      <cat.icon className="w-4 h-4 text-[#00ff41]" />
                    </div>
                    <h3 className="text-[11px] font-bold text-[#00ff41] tracking-[0.15em]">{cat.title}</h3>
                  </div>
                  <p className="text-[10px] text-[#333355] tracking-wider">
                    {cat.links.length} ARTICLES // VIEW_MODULE
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a2e] py-6 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] text-[#333355] tracking-wider">
            <span>© 2026 CYBERRANGE // ALL_RIGHTS_RESERVED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
