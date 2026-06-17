import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
  style?: React.CSSProperties;
}

export function Badge({ children, className, variant = 'default', style }: BadgeProps) {
  return (
    <span style={style} className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border uppercase tracking-[0.1em] font-mono',
      variant === 'outline' ? 'bg-transparent' : '',
      className
    )}>
      [ {children} ]
    </span>
  );
}
