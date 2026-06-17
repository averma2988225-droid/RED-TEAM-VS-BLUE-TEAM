'use client';

import { motion, useInView, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Shield, Swords, Zap, Target, Lock, Activity, ChevronRight,
  Terminal, Eye, AlertTriangle, CheckCircle2, Globe, Users, Play, Pause
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   MATRIX RAIN — Canvas background
   ═══════════════════════════════════════════════════════ */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]|;:<>?/~`';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1).map(() => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff4115';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => { clearInterval(interval); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />;
}

/* ═══════════════════════════════════════════════════════
   TYPEWRITER — Types text character by character
   ═══════════════════════════════════════════════════════ */
function Typewriter({ text, delay = 0, speed = 30, className = '' }: { text: string; delay?: number; speed?: number; className?: string }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [inView, delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span ref={ref} className={className}>
      {displayed}
      {started && displayed.length < text.length && <span className="animate-pulse">█</span>}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   COUNT UP — Animated number counter
   ═══════════════════════════════════════════════════════ */
function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const step = end / (duration * 60);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

/* ═══════════════════════════════════════════════════════
   GLITCH TEXT — Hover glitch effect
   ═══════════════════════════════════════════════════════ */
function GlitchText({ children, className = '', style }: { children: string; className?: string; style?: React.CSSProperties }) {
  const [isGlitching, setIsGlitching] = useState(false);
  const [displayText, setDisplayText] = useState(children);
  const glitchChars = '!@#$%^&*()_+-=[]{}|;:<>?/~`01';

  useEffect(() => {
    if (!isGlitching) { setDisplayText(children); return; }
    let frame = 0;
    const maxFrames = 10;
    const interval = setInterval(() => {
      if (frame >= maxFrames) {
        setDisplayText(children);
        setIsGlitching(false);
        clearInterval(interval);
        return;
      }
      const glitched = children.split('').map((char, i) => {
        if (char === ' ') return ' ';
        return Math.random() < 0.3 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char;
      }).join('');
      setDisplayText(glitched);
      frame++;
    }, 50);
    return () => clearInterval(interval);
  }, [isGlitching, children]);

  return (
    <span className={className} style={{ cursor: 'default', ...style }} onMouseEnter={() => setIsGlitching(true)}>
      {displayText}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════
   GLOW CARD — Mouse-tracking glow effect
   ═══════════════════════════════════════════════════════ */
function GlowCard({ children, borderColor = 'rgba(0,255,65,0.2)', className = '' }: { children: React.ReactNode; borderColor?: string; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setGlowPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            left: glowPos.x - 100,
            top: glowPos.y - 100,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${borderColor} 0%, transparent 70%)`,
            opacity: 0.15,
          }}
        />
      )}
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */
const features = [
  { icon: Swords, title: 'RED_TEAM_OPERATIONS', desc: 'Execute real-world attack simulations — SQL injection, XSS, brute force, OSINT, and more.', color: 'text-[#ff0033]', border: 'border-[#ff0033]/20', glow: 'rgba(255,0,51,0.4)' },
  { icon: Shield, title: 'BLUE_TEAM_DEFENSE', desc: 'Monitor threats, analyze logs, respond to incidents, and harden your defenses in real time.', color: 'text-[#00ccff]', border: 'border-[#00ccff]/20', glow: 'rgba(0,204,255,0.4)' },
  { icon: Target, title: 'CYBER_RANGE', desc: 'Live vulnerable environments with real attack-and-defense scenarios and a competitive scoreboard.', color: 'text-[#8b5cf6]', border: 'border-[#8b5cf6]/20', glow: 'rgba(139,92,246,0.4)' },
  { icon: Terminal, title: 'CTF_CHALLENGES', desc: 'Hundreds of capture-the-flag challenges from beginner to expert across all security domains.', color: 'text-[#00ff41]', border: 'border-[#00ff41]/20', glow: 'rgba(0,255,65,0.4)' },
  { icon: Eye, title: 'SIEM_DASHBOARD', desc: 'Enterprise-grade threat monitoring, log analysis, and incident response tools.', color: 'text-[#ffaa00]', border: 'border-[#ffaa00]/20', glow: 'rgba(255,170,0,0.4)' },
  { icon: Lock, title: 'SECURE_BY_DESIGN', desc: 'JWT auth, RBAC, audit logging, rate limiting, and security best practices throughout.', color: 'text-[#00ccff]', border: 'border-[#00ccff]/20', glow: 'rgba(0,204,255,0.4)' },
];

const stats = [
  { value: 50000, suffix: '+', label: 'OPERATORS', hex: '0x01' },
  { value: 1200, suffix: '+', label: 'ATTACK_SCENARIOS', hex: '0x02' },
  { value: 99, suffix: '%', label: 'DETECTION_RATE', hex: '0x03' },
  { value: 500, suffix: '+', label: 'CTF_CHALLENGES', hex: '0x04' },
];

const killChainSteps = [
  { phase: 'RECONNAISSANCE', desc: 'Scanning targets, enumerating services, gathering OSINT data.', severity: 'LOW', duration: '00:12:34', tools: ['Nmap', 'Shodan', 'theHarvester'] },
  { phase: 'INITIAL_ACCESS', desc: 'SQL injection on /api/users endpoint bypasses authentication.', severity: 'CRITICAL', duration: '00:03:21', tools: ['SQLMap', 'Burp Suite'] },
  { phase: 'PRIVILEGE_ESCALATION', desc: 'JWT algorithm confusion attack grants admin privileges.', severity: 'CRITICAL', duration: '00:01:47', tools: ['jwt_tool', 'Custom Script'] },
  { phase: 'LATERAL_MOVEMENT', desc: 'Pivoting through internal network using stolen credentials.', severity: 'HIGH', duration: '00:08:15', tools: ['Mimikatz', 'CrackMapExec'] },
  { phase: 'EXFILTRATION', desc: 'Data extraction attempt detected and blocked by Blue Team.', severity: 'BLOCKED', duration: '00:00:03', tools: ['Blocked by IDS'] },
];

const terminalLines = [
  { text: '$ ./scanner --target api.target.com --mode full', color: 'text-[#00ccff]' },
  { text: '[*] Initiating reconnaissance...', color: 'text-[#0a8a3e]' },
  { text: '[+] SQL Injection found: /api/users?id=1', color: 'text-[#ff0033]' },
  { text: '[+] XSS reflected: /search?q=<payload>', color: 'text-[#ff0033]' },
  { text: '[!] CRITICAL: Auth bypass via JWT alg=none', color: 'text-[#ffaa00]' },
  { text: '[*] Blue Team alert triggered — Incident #CR-2024-0847', color: 'text-[#8b5cf6]' },
  { text: '[+] Defense response deployed in 2.3s', color: 'text-[#00ff41]' },
];

const liveThreatFeed = [
  { time: '14:23:01', msg: 'SQLi attempt blocked — /api/users', sev: 'CRITICAL', src: '192.168.1.100' },
  { time: '14:22:47', msg: 'Port scan detected — 192.168.1.45', sev: 'HIGH', src: '10.0.0.55' },
  { time: '14:22:13', msg: 'XSS payload in search param', sev: 'HIGH', src: '172.16.0.12' },
  { time: '14:21:59', msg: 'Failed auth x50 — brute force', sev: 'MEDIUM', src: '203.0.113.42' },
  { time: '14:21:30', msg: 'SSRF attempt on metadata endpoint', sev: 'CRITICAL', src: '198.51.100.7' },
  { time: '14:20:44', msg: 'Directory traversal — /../../etc/passwd', sev: 'HIGH', src: '10.10.10.1' },
  { time: '14:20:12', msg: 'Malicious file upload intercepted', sev: 'CRITICAL', src: '192.168.2.88' },
  { time: '14:19:55', msg: 'Command injection in ping utility', sev: 'CRITICAL', src: '172.20.0.5' },
];

const testimonials = [
  { name: 'OPERATOR_CHEN', role: 'Senior Penetration Tester', company: 'CrowdStrike', quote: 'CyberRange is the most realistic attack simulation platform I\'ve used. The Red Team scenarios are identical to real engagements.' },
  { name: 'OPERATOR_RAMIREZ', role: 'SOC Analyst', company: 'Palo Alto Networks', quote: 'The Blue Team dashboard has transformed how our team practices incident response. The SIEM-style interface is exactly like the real thing.' },
  { name: 'OPERATOR_OBRIEN', role: 'CISO', company: 'FinTech Corp', quote: 'We use CyberRange to onboard and certify our entire security team. It cut our training time by 60% while improving skill quality dramatically.' },
];

const ASCII_LOGO = `
 ██████╗██╗   ██╗██████╗ ███████╗██████╗ 
██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗
██║      ╚████╔╝ ██████╔╝█████╗  ██████╔╝
██║       ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗
╚██████╗   ██║   ██████╔╝███████╗██║  ██║
 ╚═════╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝  ╚═╝
`;

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [activeKillChainStep, setActiveKillChainStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [activeThreatIndex, setActiveThreatIndex] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Auto-advance kill chain
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveKillChainStep(prev => (prev + 1) % killChainSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Auto-cycle threat feed
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveThreatIndex(prev => (prev + 1) % liveThreatFeed.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const visibleThreats = [...Array(5)].map((_, i) => {
    const idx = (activeThreatIndex + i) % liveThreatFeed.length;
    return liveThreatFeed[idx];
  });

  return (
    <div className="min-h-screen bg-black overflow-x-hidden relative">
      <MatrixRain />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 border-b border-[#1a1a2e] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#00ff41] font-bold tracking-[0.2em] text-sm">[ CYBERRANGE ]</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-[10px] text-[#0a8a3e] hover:text-[#00ff41] transition-colors tracking-[0.15em] font-mono">FEATURES</a>
            <a href="#scenarios" className="text-[10px] text-[#0a8a3e] hover:text-[#00ff41] transition-colors tracking-[0.15em] font-mono">SCENARIOS</a>
            <Link href="/pricing" className="text-[10px] text-[#0a8a3e] hover:text-[#00ff41] transition-colors tracking-[0.15em] font-mono">PRICING</Link>
            <Link href="/docs" className="text-[10px] text-[#0a8a3e] hover:text-[#00ff41] transition-colors tracking-[0.15em] font-mono">DOCS</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[10px] text-[#0a8a3e] hover:text-[#00ff41] transition-colors tracking-[0.15em] font-mono">SIGN_IN</Link>
            <Link href="/register" className="px-4 py-2 btn-primary text-[10px] font-mono tracking-[0.15em]">
              [ START_FREE ]
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Status line */}
            <div className="flex items-center gap-2 mb-8 text-[10px] font-mono tracking-[0.15em]">
              <span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse" />
              <span className="text-[#0a8a3e]">PROTOCOL: AI_THREAT_INTEL_V4</span>
              <span className="text-[#333355]">//</span>
              <span className="text-[#0a8a3e]">STATUS: ACTIVE</span>
              <ChevronRight className="w-3 h-3 text-[#333355]" />
            </div>

            {/* ASCII Art Title */}
            <pre className="text-[#00ff41] text-[8px] md:text-[11px] leading-tight mb-4 hidden md:block" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.3)' }}>
              {ASCII_LOGO}
            </pre>
            <h1 className="md:hidden text-3xl font-black text-[#00ff41] leading-tight mb-4" style={{ textShadow: '0 0 30px rgba(0, 255, 65, 0.3)' }}>
              CYBERRANGE
            </h1>

            <h2 className="text-2xl md:text-4xl font-black leading-tight mb-4">
              <GlitchText className="text-[#ff0033]" style={{ textShadow: '0 0 20px rgba(255, 0, 51, 0.3)' }}>RED TEAM</GlitchText>
              <span className="text-[#333355]"> ATTACKS. </span>
              <GlitchText className="text-[#00ccff]" style={{ textShadow: '0 0 20px rgba(0, 204, 255, 0.3)' }}>BLUE TEAM</GlitchText>
              <span className="text-[#333355]"> DEFENDS.</span>
            </h2>
            <p className="text-sm text-[#0a8a3e] mb-2 tracking-wider">
              WHERE YOUR CODEBASE STAYS <span className="text-[#00ff41] font-bold" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.3)' }}>UNBREAKABLE.</span>
            </p>
            <p className="text-[#333355] max-w-2xl text-xs leading-relaxed mb-8 tracking-wider">
              THE MOST ADVANCED CYBERSECURITY SIMULATION PLATFORM. EXPERIENCE REAL-WORLD ATTACK AND DEFENSE
              SCENARIOS, SHARPEN YOUR SKILLS, AND BUILD PRODUCTION-GRADE SECURITY EXPERTISE.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <Link href="/register" className="px-6 py-3 btn-primary text-xs font-mono tracking-[0.15em] flex items-center gap-2 group">
                <Zap className="w-3.5 h-3.5 group-hover:animate-spin" />
                [ LAUNCH_SIMULATION ]
              </Link>
              <Link href="/login" className="px-6 py-3 border border-[#1a1a2e] text-[#0a8a3e] hover:border-[#00ff41]/30 hover:text-[#00ff41] transition-all text-xs font-mono tracking-[0.15em] flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                [ VIEW_DEMO ]
              </Link>
            </div>
          </motion.div>

          {/* Interactive Terminal preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 relative"
          >
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] overflow-hidden" style={{ boxShadow: '0 0 40px rgba(0, 255, 65, 0.05)' }}>
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1a1a2e] bg-black">
                <span className="w-2 h-2 bg-[#ff0033] hover:brightness-150 transition-all cursor-pointer" />
                <span className="w-2 h-2 bg-[#ffaa00] hover:brightness-150 transition-all cursor-pointer" />
                <span className="w-2 h-2 bg-[#00ff41] hover:brightness-150 transition-all cursor-pointer" />
                <span className="ml-3 text-[10px] text-[#333355] font-mono tracking-wider">CYBERRANGE ~ RED_TEAM_OPS</span>
              </div>
              <div className="p-5 font-mono text-xs text-left space-y-1.5">
                {terminalLines.map((line, i) => (
                  <div key={i} className={`${line.color} tracking-wider`}>
                    <Typewriter text={line.text} delay={800 + i * 600} speed={20} />
                  </div>
                ))}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ delay: 5.5, duration: 1, repeat: Infinity }}
                  className="text-[#00ff41] inline-block"
                >
                  █
                </motion.span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-[#1a1a2e] relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ value, suffix, label, hex }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(0,255,65,0.3)' }}
              className="bg-[#0a0a0f] border border-[#1a1a2e] p-4 cursor-default transition-shadow hover:shadow-[0_0_20px_rgba(0,255,65,0.1)]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-[#333355] font-mono tracking-wider">{hex}</span>
              </div>
              <p className="text-2xl font-black text-[#00ff41] font-mono tracking-wider" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.2)' }}>
                <CountUp end={value} />{suffix}
              </p>
              <p className="text-[10px] text-[#333355] mt-1 tracking-[0.15em] font-mono">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features — Interactive glow cards */}
      <section id="features" className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <p className="text-[10px] text-[#333355] font-mono tracking-[0.2em] mb-2">SYS_MSG // MODULE_OVERVIEW</p>
            <h2 className="text-xl font-black text-[#00ff41] tracking-wider">
              <GlitchText>OPERATIONAL CAPABILITIES</GlitchText>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlowCard borderColor={f.glow} className={`bg-[#0a0a0f] border ${f.border} p-5 cyber-card h-full hover:border-opacity-50 transition-all duration-300`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`w-4 h-4 ${f.color}`} />
                      <span className="text-[10px] text-[#333355] font-mono">[+]</span>
                      <h3 className="text-xs font-bold text-[#00ff41] tracking-[0.1em]">{f.title}</h3>
                    </div>
                    <p className="text-[11px] text-[#0a8a3e] leading-relaxed tracking-wider normal-case">{f.desc}</p>
                  </GlowCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Kill Chain + Live Threat Feed */}
      <section id="scenarios" className="py-20 px-6 border-y border-[#1a1a2e] relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Kill Chain — Interactive */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-[#333355] font-mono tracking-[0.2em]">NODE_05 // KILL_CHAIN</p>
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="text-[#333355] hover:text-[#00ff41] transition-colors p-1"
                  title={isAutoPlaying ? 'Pause' : 'Play'}
                >
                  {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
              </div>
              <h2 className="text-lg font-black text-[#00ff41] mb-4 tracking-wider">
                <GlitchText>ATTACK_CHAIN_VISUALIZATION</GlitchText>
              </h2>
              <p className="text-xs text-[#0a8a3e] leading-relaxed mb-6 tracking-wider normal-case">Click any phase to inspect details. Watch the kill chain progress in real time.</p>

              <div className="space-y-2">
                {killChainSteps.map((step, i) => (
                  <motion.div
                    key={step.phase}
                    onClick={() => { setActiveKillChainStep(i); setIsAutoPlaying(false); }}
                    className={`p-3 border cursor-pointer transition-all duration-300 ${
                      i === activeKillChainStep
                        ? 'border-[#00ff41]/40 bg-[#00ff41]/5 shadow-[0_0_15px_rgba(0,255,65,0.1)]'
                        : i < activeKillChainStep
                        ? 'border-[#1a1a2e] bg-[#0a0a0f]'
                        : 'border-[#1a1a2e]/50 bg-transparent opacity-40'
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className={`w-5 text-center font-bold ${
                        i <= activeKillChainStep ? (step.severity === 'BLOCKED' ? 'text-[#00ff41]' : 'text-[#ff0033]') : 'text-[#333355]'
                      }`}>{String(i + 1).padStart(2, '0')}</span>
                      <span className={`flex-1 tracking-wider ${i <= activeKillChainStep ? 'text-[#00ff41]' : 'text-[#333355]'}`}>{step.phase}</span>
                      {i < activeKillChainStep && <CheckCircle2 className="w-3 h-3 text-[#00ff41]" />}
                      {i === activeKillChainStep && <span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse" />}
                      {step.severity === 'BLOCKED' && i <= activeKillChainStep && (
                        <span className="text-[9px] text-[#ffaa00] border border-[#ffaa00]/30 px-1.5 py-0.5 tracking-wider">BLOCKED</span>
                      )}
                    </div>

                    {/* Expanded detail panel */}
                    <AnimatePresence>
                      {i === activeKillChainStep && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-[#1a1a2e] space-y-2">
                            <p className="text-[10px] text-[#0a8a3e] tracking-wider normal-case">{step.desc}</p>
                            <div className="flex items-center gap-4 text-[9px] font-mono tracking-wider">
                              <span className="text-[#333355]">DURATION: <span className="text-[#ffaa00]">{step.duration}</span></span>
                              <span className="text-[#333355]">TOOLS: <span className="text-[#00ccff]">{step.tools.join(', ')}</span></span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-1 bg-[#1a1a2e] overflow-hidden">
                <motion.div
                  className="h-full bg-[#00ff41]"
                  animate={{ width: `${((activeKillChainStep + 1) / killChainSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>

            {/* Live Threat Feed — Auto-cycling */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-[#0a0a0f] border border-[#00ccff]/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-3 h-3 text-[#00ccff]" />
                  <span className="text-[10px] font-bold text-[#00ccff] tracking-[0.15em] font-mono">LIVE_THREAT_FEED</span>
                  <span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse ml-auto" />
                  <span className="text-[9px] text-[#00ff41] font-mono animate-pulse">LIVE</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {visibleThreats.map((log, i) => (
                      <motion.div
                        key={`${log.time}-${log.msg}-${activeThreatIndex}-${i}`}
                        initial={{ opacity: 0, x: 20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="flex items-start gap-3 text-[10px] font-mono tracking-wider"
                      >
                        <span className="text-[#333355] shrink-0">{log.time}</span>
                        <span className="text-[#0a8a3e] flex-1 normal-case">{log.msg}</span>
                        <span className={`shrink-0 px-1.5 py-0.5 border font-bold ${
                          log.sev === 'CRITICAL' ? 'border-[#ff0033]/30 text-[#ff0033]' :
                          log.sev === 'HIGH' ? 'border-[#ff6600]/30 text-[#ff6600]' :
                          'border-[#ffaa00]/30 text-[#ffaa00]'
                        }`}>{log.sev}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                {/* Network activity bar */}
                <div className="mt-4 pt-3 border-t border-[#1a1a2e] flex items-center gap-4 text-[9px] font-mono tracking-wider">
                  <span className="text-[#333355]">PACKETS: <span className="text-[#00ccff]">1,847/s</span></span>
                  <span className="text-[#333355]">BLOCKED: <span className="text-[#ff0033]">23</span></span>
                  <span className="text-[#333355]">LATENCY: <span className="text-[#00ff41]">4ms</span></span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials — Auto-cycling carousel */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-[10px] text-[#333355] font-mono tracking-[0.2em] mb-2">NODE_06 // FIELD_REPORTS</p>
            <h2 className="text-lg font-black text-[#00ff41] tracking-wider">
              <GlitchText>OPERATOR_TESTIMONIALS</GlitchText>
            </h2>
          </motion.div>

          {/* Carousel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-[#0a0a0f] border border-[#1a1a2e] p-8 md:p-10"
              >
                <p className="text-sm text-[#0a8a3e] leading-relaxed mb-6 normal-case tracking-wider">&quot;{testimonials[activeTestimonial].quote}&quot;</p>
                <div className="border-t border-[#1a1a2e] pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-[#00ff41] font-mono tracking-[0.1em]">{testimonials[activeTestimonial].name}</p>
                    <p className="text-[9px] text-[#333355] font-mono tracking-wider">{testimonials[activeTestimonial].role} // {testimonials[activeTestimonial].company}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 transition-all duration-300 ${
                    i === activeTestimonial ? 'bg-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,0.5)]' : 'bg-[#333355] hover:bg-[#0a8a3e]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-[#0a0a0f] border border-[#00ff41]/20 p-10 text-center"
          style={{ boxShadow: '0 0 30px rgba(0, 255, 65, 0.05)' }}
        >
          <p className="text-[10px] text-[#333355] font-mono tracking-[0.2em] mb-4">SYS_MSG // INITIATE_PROTOCOL</p>
          <h2 className="text-xl font-black text-[#00ff41] mb-3 tracking-wider" style={{ textShadow: '0 0 20px rgba(0, 255, 65, 0.2)' }}>
            <GlitchText>START_SECURITY_TRAINING</GlitchText>
          </h2>
          <p className="text-[#333355] text-xs mb-8 tracking-wider font-mono">JOIN 50,000+ OPERATORS. NO CREDIT CARD REQUIRED.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 btn-primary text-xs font-mono tracking-[0.15em] group">
            <Zap className="w-3.5 h-3.5 group-hover:animate-spin" />
            [ CREATE_OPERATOR_ACCOUNT ]
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a2e] py-6 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] text-[#333355] font-mono tracking-wider">
            <span>© 2026 CYBERRANGE // ALL_RIGHTS_RESERVED</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] text-[#333355] font-mono tracking-wider">
            {['PRIVACY', 'TERMS', 'SECURITY', 'BLOG'].map(l => (
              <a key={l} href="#" className="hover:text-[#00ff41] transition-colors">{l}</a>
            ))}
            <Link href="/docs" className="hover:text-[#00ff41] transition-colors">DOCS</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
