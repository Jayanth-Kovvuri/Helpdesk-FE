import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
};

/** Stand-in for @freshworks/fs-react-ui-library — swap imports at this layer. */
export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50',
        variant === 'primary' && 'bg-helpdesk-primary text-white hover:bg-blue-700',
        variant === 'secondary' &&
          'border border-helpdesk-border bg-white text-slate-800 hover:bg-slate-50',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
