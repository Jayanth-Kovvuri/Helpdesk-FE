import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import HelpdeskLogo from '@/assets/helpdesk-logo.svg?react';
import { useMe } from '@/api/hooks/useAuth';
import { UserMenu } from '@/components/layout/UserMenu';
import { cn } from '@/lib/cn';
import { selectFieldClass } from '@/lib/selectFieldClass';
import { useUiStore, type Locale } from '@/stores/uiStore';

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { data: user } = useMe();
  const { locale, sidebarOpen, setLocale, setSidebarOpen } = useUiStore(
    useShallow((state) => ({
      locale: state.locale,
      sidebarOpen: state.sidebarOpen,
      setLocale: state.setLocale,
      setSidebarOpen: state.setSidebarOpen,
    })),
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-helpdesk-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link
            to="/tickets"
            className="flex items-center gap-3 rounded-md text-slate-900 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-helpdesk-primary"
            aria-label={t('app.tickets')}
          >
            <HelpdeskLogo className="h-9 w-9" aria-hidden />
            <span className="font-semibold">{t('app.title')}</span>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={locale}
              onChange={(event) => {
                setLocale(event.target.value as Locale);
              }}
              className={cn(selectFieldClass, 'w-36')}
              aria-label="Language"
            >
              <option value="en">{t('app.localeEn')}</option>
              <option value="es">{t('app.localeEs')}</option>
              <option value="ar">{t('app.localeAr')}</option>
            </select>
            {user ? <UserMenu user={user} /> : null}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl px-4 py-6">
        <aside
          className={cn(
            'shrink-0 border-e border-helpdesk-border transition-[width] duration-200',
            sidebarOpen ? 'w-44 me-6' : 'w-12 me-4',
          )}
        >
          <div className={cn('flex pb-2', sidebarOpen ? 'justify-end' : 'justify-center')}>
            <button
              type="button"
              aria-label={sidebarOpen ? t('app.collapseSidebar') : t('app.expandSidebar')}
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              onClick={() => {
                setSidebarOpen(!sidebarOpen);
              }}
            >
              <span className="inline-block rtl:rotate-180">{sidebarOpen ? '‹' : '›'}</span>
            </button>
          </div>

          {sidebarOpen ? (
            <nav className="space-y-1 text-sm">
              <Link
                to="/tickets"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white"
                activeProps={{ className: 'bg-white font-medium text-helpdesk-primary' }}
                activeOptions={{ exact: true }}
              >
                <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v3h2a1 1 0 110 2h-2v3h2a1 1 0 110 2h-2v3a2 2 0 01-2 2H4a2 2 0 01-2-2v-3h-2a1 1 0 110-2h2V8H2a1 1 0 110-2h2V5z" />
                </svg>
                {t('app.tickets')}
              </Link>
              <Link
                to="/account"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white"
                activeProps={{ className: 'bg-white font-medium text-helpdesk-primary' }}
              >
                <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {t('app.account')}
              </Link>
              {user?.role.code === 'admin' ? (
                <>
                  <Link
                    to="/tickets/all"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white"
                    activeProps={{ className: 'bg-white font-medium text-helpdesk-primary' }}
                  >
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                    {t('allTickets.sidebarLabel')}
                  </Link>
                  <Link
                    to="/users/new"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white"
                    activeProps={{ className: 'bg-white font-medium text-helpdesk-primary' }}
                  >
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.5 1.5H19a1 1 0 011 1v15a1 1 0 01-1 1h-8.5m.5-18v18m-8-9a3 3 0 106 0 3 3 0 00-6 0z" />
                    </svg>
                    {t('users.title')}
                  </Link>
                  <Link
                    to="/sla"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-white"
                    activeProps={{ className: 'bg-white font-medium text-helpdesk-primary' }}
                  >
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {t('sla.title')}
                  </Link>
                </>
              ) : null}
            </nav>
          ) : null}
        </aside>

        <main className={cn('min-w-0 flex-1')}>{children}</main>
      </div>
    </div>
  );
}
