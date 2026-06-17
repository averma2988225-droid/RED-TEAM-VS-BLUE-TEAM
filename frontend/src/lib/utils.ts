import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Severity } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const severityColor: Record<Severity, string> = {
  LOW: 'text-[#00ff41] bg-[#00ff41]/10 border-[#00ff41]/20',
  MEDIUM: 'text-[#ffaa00] bg-[#ffaa00]/10 border-[#ffaa00]/20',
  HIGH: 'text-[#ff6600] bg-[#ff6600]/10 border-[#ff6600]/20',
  CRITICAL: 'text-[#ff0033] bg-[#ff0033]/10 border-[#ff0033]/20',
};

export const severityDot: Record<Severity, string> = {
  LOW: 'bg-[#00ff41]',
  MEDIUM: 'bg-[#ffaa00]',
  HIGH: 'bg-[#ff6600]',
  CRITICAL: 'bg-[#ff0033]',
};

export const roleColor: Record<string, string> = {
  STUDENT: 'text-[#333355] bg-[#333355]/10',
  RED_TEAM: 'text-[#ff0033] bg-[#ff0033]/10',
  BLUE_TEAM: 'text-[#00ccff] bg-[#00ccff]/10',
  ADMIN: 'text-[#8b5cf6] bg-[#8b5cf6]/10',
};

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelative(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function scoreToGrade(score: number): { grade: string; color: string } {
  if (score >= 9000) return { grade: 'S+', color: 'text-[#8b5cf6]' };
  if (score >= 7000) return { grade: 'A', color: 'text-[#00ff41]' };
  if (score >= 5000) return { grade: 'B', color: 'text-[#00ccff]' };
  if (score >= 3000) return { grade: 'C', color: 'text-[#ffaa00]' };
  return { grade: 'D', color: 'text-[#333355]' };
}
