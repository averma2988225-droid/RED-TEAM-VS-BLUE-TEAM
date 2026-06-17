'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('PASSWORDS DO NOT MATCH'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { email: form.email, username: form.username, password: form.password });
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'REGISTRATION FAILED.');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthBlocks = '█'.repeat(strength) + '░'.repeat(4 - strength);
  const strengthColor = ['text-[#ff0033]', 'text-[#ff6600]', 'text-[#ffaa00]', 'text-[#00ff41]'][strength - 1] || 'text-[#333355]';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0a0f] border border-[#1a1a2e] p-8">
      <div className="mb-8">
        <p className="text-[9px] text-[#333355] font-mono tracking-[0.2em] mb-3">0x0F01 // REG_MODULE</p>
        <h1 className="text-sm font-bold text-[#00ff41] tracking-[0.15em]">CREATE_OPERATOR</h1>
        <p className="text-[10px] text-[#333355] mt-1 tracking-wider font-mono">REGISTER FOR CYBERRANGE PLATFORM</p>
      </div>

      {error && (
        <div className="mb-4 p-3 border border-[#ff0033]/30 bg-[#ff0033]/5 text-[10px] text-[#ff0033] font-mono tracking-wider">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="USERNAME" placeholder="red_operator" icon={<User className="w-3.5 h-3.5" />}
          value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
        <Input label="EMAIL" type="email" placeholder="you@example.com" icon={<Mail className="w-3.5 h-3.5" />}
          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />

        <div className="relative">
          <Input label="PASSWORD" type={showPass ? 'text' : 'password'} placeholder="Min 8 chars, upper + number"
            icon={<Lock className="w-3.5 h-3.5" />}
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          <button type="button" onClick={() => setShowPass(s => !s)}
            className="absolute right-3 top-8 text-[#333355] hover:text-[#00ff41] transition-colors">
            {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {form.password && (
          <div className="flex items-center gap-2 font-mono">
            <span className={`text-sm tracking-widest ${strengthColor}`}>{strengthBlocks}</span>
            <span className="text-[9px] text-[#333355] tracking-wider">
              {['WEAK', 'FAIR', 'GOOD', 'STRONG'][strength - 1] || 'NONE'}
            </span>
          </div>
        )}

        <Input label="CONFIRM_PASSWORD" type="password" placeholder="••••••••" icon={<Lock className="w-3.5 h-3.5" />}
          value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required />

        <Button type="submit" isLoading={loading} className="w-full" size="lg">
          [ CREATE_OPERATOR ]
        </Button>
      </form>

      <p className="text-center text-[10px] text-[#333355] mt-6 font-mono tracking-wider">
        EXISTING OPERATOR?{' '}
        <Link href="/login" className="text-[#00ff41] hover:text-[#00ff41]">AUTHENTICATE</Link>
      </p>
    </motion.div>
  );
}
