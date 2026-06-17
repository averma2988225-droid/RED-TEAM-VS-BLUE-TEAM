'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', totpCode: '' });
  const [showPass, setShowPass] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.requiresTwoFactor) { setRequiresTwoFactor(true); setLoading(false); return; }
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'AUTHENTICATION FAILED. RETRY.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0a0f] border border-[#1a1a2e] p-8">
      <div className="mb-8">
        <p className="text-[9px] text-[#333355] font-mono tracking-[0.2em] mb-3">0x0F00 // AUTH_MODULE</p>
        <h1 className="text-sm font-bold text-[#00ff41] tracking-[0.15em]">AUTHENTICATION_PORTAL</h1>
        <p className="text-[10px] text-[#333355] mt-1 tracking-wider font-mono">SIGN IN TO CYBERRANGE OPERATIONS</p>
      </div>

      {error && (
        <div className="mb-4 p-3 border border-[#ff0033]/30 bg-[#ff0033]/5 text-[10px] text-[#ff0033] flex items-center gap-2 font-mono tracking-wider">
          <Shield className="w-3 h-3 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!requiresTwoFactor ? (
          <>
            <Input
              label="EMAIL"
              type="email"
              placeholder="operator@cyberrange.io"
              icon={<Mail className="w-3.5 h-3.5" />}
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <div className="relative">
              <Input
                label="PASSWORD"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock className="w-3.5 h-3.5" />}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-8 text-[#333355] hover:text-[#00ff41] transition-colors">
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center justify-end">
              <Link href="/forgot-password" className="text-[10px] text-[#0a8a3e] hover:text-[#00ff41] font-mono tracking-wider">FORGOT_PASSWORD?</Link>
            </div>
          </>
        ) : (
          <div>
            <p className="text-[10px] text-[#0a8a3e] mb-4 text-center font-mono tracking-wider">ENTER 6-DIGIT AUTHENTICATOR CODE</p>
            <Input
              label="2FA_CODE"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={form.totpCode}
              onChange={e => setForm(f => ({ ...f, totpCode: e.target.value }))}
              className="text-center text-xl tracking-[0.5em]"
            />
          </div>
        )}

        <Button type="submit" isLoading={loading} className="w-full" size="lg">
          {requiresTwoFactor ? '[ VERIFY_CODE ]' : '[ AUTHENTICATE ]'}
        </Button>
      </form>

      <p className="text-center text-[10px] text-[#333355] mt-6 font-mono tracking-wider">
        NO ACCOUNT?{' '}
        <Link href="/register" className="text-[#00ff41] hover:text-[#00ff41]">CREATE_OPERATOR</Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-4 p-3 border border-[#1a1a2e] bg-black">
        <p className="text-[9px] text-[#333355] text-center mb-2 font-mono tracking-[0.15em]">DEMO_CREDENTIALS</p>
        <div className="space-y-1 text-[10px] font-mono text-center text-[#0a8a3e] tracking-wider">
          <p>admin@cyberrange.io // Admin@123!</p>
          <p>redteam@cyberrange.io // User@123!</p>
        </div>
      </div>
    </motion.div>
  );
}
