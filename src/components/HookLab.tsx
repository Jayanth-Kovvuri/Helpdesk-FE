import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import { cn } from '@/lib/cn';

const DEMO_TICKETS = ['Printer jam', 'VPN down', 'Password reset'];

/**
 * Small sandbox for core hooks (Phase 1 learning).
 * Server data will move to TanStack Query in Phase 3.
 */
export function HookLab() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/' && event.target === document.body) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const onQueryChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return DEMO_TICKETS;
    return DEMO_TICKETS.filter((title) => title.toLowerCase().includes(needle));
  }, [query]);

  const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    inputRef.current?.select();
  }, []);

  return (
    <section className="rounded-lg border border-helpdesk-border bg-white p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Hook lab
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Renders (StrictMode may double in dev): {renderCount.current}. Press <kbd>/</kbd>{' '}
        to focus
        search.
      </p>
      <form onSubmit={onSubmit} className="mt-3">
        <label htmlFor="hook-lab-search" className="sr-only">
          Filter demo tickets
        </label>
        <input
          ref={inputRef}
          id="hook-lab-search"
          value={query}
          onChange={onQueryChange}
          placeholder="Filter demo tickets…"
          className={cn(
            'w-full rounded-md border border-helpdesk-border px-3 py-2 text-sm',
          )}
        />
      </form>
      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {filtered.map((title) => (
          <li key={title} className="rounded bg-slate-50 px-2 py-1">
            {title}
          </li>
        ))}
      </ul>
    </section>
  );
}
