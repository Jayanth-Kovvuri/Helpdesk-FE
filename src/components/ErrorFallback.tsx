import type { FallbackProps } from 'react-error-boundary';

import { cn } from '@/lib/cn';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : 'Unknown error';

  return (
    <div
      role="alert"
      className={cn(
        'mx-auto mt-16 max-w-lg rounded-lg border border-red-200 bg-white p-6 shadow-sm',
      )}
    >
      <h1 className="text-lg font-semibold text-red-700">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-600">{message}</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="mt-4 rounded-md bg-helpdesk-primary px-4 py-2 text-sm font-medium text-white"
      >
        Try again
      </button>
    </div>
  );
}
