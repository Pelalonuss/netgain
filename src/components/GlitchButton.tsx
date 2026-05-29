import { useRef, useState, ReactNode } from 'react';

interface GlitchButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function GlitchButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
}: GlitchButtonProps) {
  const [glitching, setGlitching] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    if (disabled) return;
    setGlitching(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setGlitching(false), 350);
    onClick?.();
  };

  const variantClasses: Record<string, string> = {
    primary: 'bg-cyber-yellow text-black font-black border border-cyber-yellow hover:shadow-cyber-lg active:scale-95',
    secondary: 'bg-transparent text-cyber-yellow border border-cyber-yellow hover:bg-cyber-yellow hover:text-black active:scale-95',
    danger: 'bg-transparent text-cyber-magenta border border-cyber-magenta hover:bg-cyber-magenta hover:text-black active:scale-95',
    ghost: 'bg-transparent text-cyber-yellow border border-transparent hover:border-cyber-yellow active:scale-95 opacity-70 hover:opacity-100',
    cyan: 'bg-transparent text-cyber-cyan border border-cyber-cyan hover:bg-cyber-cyan hover:text-black active:scale-95',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  const label = typeof children === 'string' ? children : '';

  return (
    <button
      data-text={label}
      onClick={handleClick}
      disabled={disabled}
      className={[
        'glitch-btn',
        'font-orbitron font-bold tracking-widest uppercase',
        'transition-all duration-200',
        'relative overflow-hidden',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        glitching ? 'glitching' : '',
        className,
      ].join(' ')}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
