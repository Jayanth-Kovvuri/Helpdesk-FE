import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id ?? props.name;

  return (
    <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
      {label}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'mt-1 w-full rounded-md border px-3 py-2 text-sm',
          error ? 'border-red-400' : 'border-helpdesk-border',
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
});
