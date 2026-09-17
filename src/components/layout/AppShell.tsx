import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';

import HelpdeskLogo from '@/assets/helpdesk-logo.svg?react';
import { useLogout, useMe } from '@/api/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { useUiStore, type Locale } from '@/stores/uiStore';

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { data: user } = useMe();
  const logout = useLogout();
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
          <div className="flex items-center gap-3">
            <HelpdeskLogo className="h-9 w-9" aria-hidden />
            <span className="font-semibold text-slate-900">{t('app.title')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={locale}
              onChange={(event) => {
                setLocale(event.target.value as Locale);
              }}
              className="w-36 rounded-md border border-helpdesk-border px-2 py-2 text-sm"
              aria-label="Language"
            >
              <option value="en">{t('app.localeEn')}</option>
              <option value="es">{t('app.localeEs')}</option>
              <option value="ar">{t('app.localeAr')}</option>
            </select>
            {user ? (
              <>
                <span className="text-sm text-slate-600">{user.email}</span>
                <Button
                  variant="secondary"
                  className="w-36"
                  onClick={() => {
                    void logout.mutateAsync().then(() => {
                      window.location.href = '/login';
                    });
                  }}
                >
                  {t('app.logout')}
                </Button>
              </>
            ) : null}
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
                className="block rounded-md px-2 py-1.5 hover:bg-white"
                activeProps={{ className: 'bg-white font-medium text-helpdesk-primary' }}
              >
                {t('app.tickets')}
              </Link>
              <Link
                to="/account"
                className="block rounded-md px-2 py-1.5 hover:bg-white"
                activeProps={{ className: 'bg-white font-medium text-helpdesk-primary' }}
              >
                {t('app.account')}
              </Link>
              {user?.role.code === 'admin' ? (
                <>
                  <Link
                    to="/tickets/all"
                    className="block rounded-md px-2 py-1.5 hover:bg-white"
                    activeProps={{ className: 'bg-white font-medium text-helpdesk-primary' }}
                  >
                    {t('allTickets.title')}
                  </Link>
                  <Link
                    to="/users/new"
                    className="block rounded-md px-2 py-1.5 hover:bg-white"
                    activeProps={{ className: 'bg-white font-medium text-helpdesk-primary' }}
                  >
                    {t('users.title')}
                  </Link>
                  <Link
                    to="/sla"
                    className="block rounded-md px-2 py-1.5 hover:bg-white"
                    activeProps={{ className: 'bg-white font-medium text-helpdesk-primary' }}
                  >
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
