import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, icon, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-[10px] font-semibold text-[#0a8a3e] mb-1.5 uppercase tracking-[0.15em]">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333355]">{icon}</div>}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#333355] text-sm pointer-events-none" style={icon ? { left: '2.5rem' } : undefined}>&gt;</span>
        <input
          ref={ref}
          className={cn(
            'w-full bg-black border border-[#1a1a2e] px-4 py-2.5 text-sm text-[#00ff41] placeholder-[#333355] font-mono uppercase tracking-wider',
            'focus:outline-none focus:border-[#00ff41]/50 focus:shadow-[0_0_4px_rgba(0,255,65,0.1)] transition-all',
            icon ? 'pl-14' : 'pl-8',
            error && 'border-[#ff0033]/50 focus:border-[#ff0033]/50 focus:shadow-[0_0_4px_rgba(255,0,51,0.1)]',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-[10px] text-[#ff0033] uppercase tracking-wider">{error}</p>}
    </div>
  );
});
Input.displayName = 'Input';
