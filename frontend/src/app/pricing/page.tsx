'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const pricingTiers = [
  {
    id: 'NODE_01',
    name: 'BASE',
    price: '4,999',
    ascii: `
    .---.
   /     \\
  |       |
   \\     /
    '---'
    `,
    color: 'text-[#00ff41]',
    borderColor: 'border-[#00ff41]/30',
    btnClass: 'bg-[#0a0a0f] text-[#00ff41] border border-[#00ff41]/30 hover:bg-[#00ff41]/10 hover:shadow-[0_0_15px_rgba(0,255,65,0.2)]',
    features: [
      '10_OPERATOR_SEATS',
      'STANDARD_ATTACK_SCENARIOS',
      'ASYNC_COMMUNICATION',
      'COMMUNITY_SUPPORT',
      'BASIC_SIEM_INTEGRATION'
    ],
    buttonText: 'ALLOCATE_BASE'
  },
  {
    id: 'NODE_02',
    name: 'CORE',
    price: '8,999',
    ascii: `
   .-----.
  /  _ _  \\
 |  ( * )  |
  \\  - -  /
   '-----'
    `,
    color: 'text-[#ffaa00]',
    borderColor: 'border-[#ffaa00]/40',
    btnClass: 'bg-[#ffaa00]/10 text-[#ffaa00] border border-[#ffaa00]/50 hover:bg-[#ffaa00]/20 hover:shadow-[0_0_15px_rgba(255,170,0,0.3)]',
    features: [
      '50_OPERATOR_SEATS',
      'ADVANCED_ATTACK_SCENARIOS',
      'REALTIME_SLACK_SYNC',
      'DEDICATED_SUPPORT',
      'FULL_SIEM_INTEGRATION',
      'CUSTOM_VULNERABILITIES'
    ],
    buttonText: 'ALLOCATE_CORE',
    popular: true
  },
  {
    id: 'NODE_03',
    name: 'OMNI',
    price: '15,999',
    ascii: `
  _-------_
 /  *   *  \\
|  *     *  |
 \\  *   *  /
  '-------'
    `,
    color: 'text-[#ff0033]',
    borderColor: 'border-[#ff0033]/50',
    btnClass: 'bg-[#0a0a0f] text-[#ff0033] border border-[#ff0033]/50 hover:bg-[#ff0033]/10 hover:shadow-[0_0_15px_rgba(255,0,51,0.2)]',
    features: [
      'UNLIMITED_OPERATOR_SEATS',
      'ZERO_DAY_SCENARIOS',
      'DEDICATED_INFRASTRUCTURE',
      '24_7_INCIDENT_RESPONSE',
      'API_ACCESS_FULL',
      'ON_PREM_DEPLOYMENT'
    ],
    buttonText: 'ALLOCATE_OMNI'
  }
];

export default function PricingPage() {
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
      <main className="flex-1 pt-28 pb-20 px-6 max-w-7xl mx-auto w-full relative">
        <div className="flex items-center gap-2 mb-8 text-[10px] font-mono tracking-[0.15em]">
          <span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse" />
          <span className="text-[#0a8a3e]">PROTOCOL: PRICING_ALGORITHM_V2</span>
          <span className="text-[#333355]">//</span>
          <span className="text-[#0a8a3e]">STATUS: ACTIVE</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-3xl md:text-5xl font-black text-[#00ff41] mb-4 tracking-wider" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.3)' }}>
            RESOURCE_ALLOCATION
          </h1>
          <p className="text-[#0a8a3e] text-xs max-w-2xl leading-relaxed tracking-wider">
            PROCURE THE NECESSARY COMPUTE AND OPERATIONAL CAPACITY FOR YOUR CYBERSECURITY INITIATIVES.
            ALL TIERS INCLUDE BARE-METAL ISOLATION AND ENCRYPTED TELEMETRY.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`relative bg-[#0a0a0f] border ${tier.borderColor} p-6 flex flex-col ${tier.popular ? 'shadow-[0_0_30px_rgba(255,170,0,0.1)]' : ''}`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-[#ffaa00]/20 text-[#ffaa00] text-[9px] px-2 py-1 tracking-wider border-b border-l border-[#ffaa00]/40">
                  RECOMMENDED_NODE
                </div>
              )}
              
              <div className="mb-6 border-b border-[#1a1a2e] pb-6">
                <p className="text-[10px] text-[#333355] tracking-[0.2em] mb-2">{tier.id} // {tier.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${tier.color} tracking-wider`}>{tier.price}</span>
                  <span className="text-[10px] text-[#333355] tracking-wider">USD/MO</span>
                </div>
              </div>

              <pre className={`text-[8px] md:text-[10px] leading-tight mb-8 ${tier.color} opacity-70 text-center`}>
                {tier.ascii}
              </pre>

              <div className="flex-1 mb-8">
                <p className="text-[10px] text-[#333355] tracking-[0.2em] mb-4">INCLUDED_MODULES:</p>
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[10px] tracking-wider">
                      <span className={tier.color}>[+]</span>
                      <span className="text-[#0a8a3e]">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/register" className={`block w-full text-center py-3 text-[10px] font-bold tracking-[0.2em] transition-all ${tier.btnClass}`}>
                [ {tier.buttonText} ]
              </Link>
            </motion.div>
          ))}
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
