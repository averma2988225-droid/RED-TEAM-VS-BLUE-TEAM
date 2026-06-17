import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children, className, variant = 'primary', size = 'md', isLoading, disabled, ...props
}, ref) => {
  const variants = {
    primary: 'btn-primary',
    danger: 'btn-danger',
    ghost: 'bg-transparent hover:bg-[#00ff41]/5 border border-transparent hover:border-[#1a1a2e] text-[#0a8a3e] hover:text-[#00ff41]',
    outline: 'bg-transparent border border-[#1a1a2e] text-[#0a8a3e] hover:border-[#00ff41]/40 hover:text-[#00ff41] hover:bg-[#00ff41]/5',
    success: 'bg-transparent border border-[#00ff41]/30 text-[#00ff41] hover:bg-[#00ff41]/10 hover:border-[#00ff41]/60',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-sm' };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-mono font-medium tracking-wider uppercase transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="animate-pulse tracking-widest">[ processing... ]</span>
      ) : (
        children
      )}
    </button>
  );
});
Button.displayName = 'Button';
