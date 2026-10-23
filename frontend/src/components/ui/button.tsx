import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-2.5 text-xs rounded-md',
      md: 'h-9 px-3.5 text-sm rounded-md',
      lg: 'h-10 px-4 text-base rounded-md',
    };

    const variantClasses = {
      primary: 'bg-accent text-accent-fg hover:opacity-95 shadow-sm active:translate-y-[1px]',
      secondary: 'bg-surface border border-border-strong text-text hover:bg-surface-2 active:translate-y-[1px]',
      ghost: 'bg-transparent text-text hover:bg-surface-2 active:translate-y-[1px]',
      danger: 'border border-danger text-danger hover:bg-danger-soft active:translate-y-[1px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring',
          'disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
