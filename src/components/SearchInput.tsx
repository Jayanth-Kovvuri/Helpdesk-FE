import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

/** forwardRef — parent can focus the input (e.g. keyboard shortcut). */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ label, className, id, ...props }, ref) {
    const inputId = id ?? 'ticket-search';

    return (
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
        <input
          ref={ref}
          id={inputId}
          type="search"
          className={cn(
            'mt-1 w-full rounded-md border border-helpdesk-border px-3 py-2 text-sm',
            'focus:border-helpdesk-primary focus:outline-none focus:ring-2 focus:ring-blue-200',
            className,
          )}
          {...props}
        />
      </label>
    );
  },
);
