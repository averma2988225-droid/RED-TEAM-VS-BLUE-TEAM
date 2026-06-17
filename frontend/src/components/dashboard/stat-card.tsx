import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  positive?: boolean;
  color?: string;
  subtitle?: string;
}

export function StatCard({ title, value, icon, change, positive, color = 'text-[#00ff41]', subtitle }: StatCardProps) {
  return (
    <div className="bg-[#0a0a0f] border border-[#1a1a2e] p-4 cyber-card hover:border-[#1a1a2e]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[#333355] uppercase tracking-[0.15em] font-mono">{title}</span>
        <div className={cn('opacity-40', color)}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold font-mono text-[#00ff41] mb-0.5 tracking-wider">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <div className="flex items-center gap-2">
        {change && (
          <span className={cn('text-[10px] font-mono tracking-wider', positive ? 'text-[#00ff41]' : 'text-[#ff0033]')}>
            {positive ? '↑' : '↓'} {change}
          </span>
        )}
        {subtitle && <span className="text-[10px] text-[#333355] font-mono">{subtitle}</span>}
      </div>
    </div>
  );
}
