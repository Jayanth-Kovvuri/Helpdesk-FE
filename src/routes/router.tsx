import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

import { queryClient } from '@/app/queryClient';
import { sessionService } from '@/api/services/sessionService';
import { ApiError } from '@/api/client';
import { AppShell } from '@/components/layout/AppShell';
import { ErrorFallback } from '@/components/ErrorFallback';
import { ErrorBoundary } from 'react-error-boundary';

const LoginPage = lazy(async () => import('@/routes/pages/LoginPage'));
const TicketsPage = lazy(async () => import('@/routes/pages/TicketsPage'));
const TicketDetailPage = lazy(async () => import('@/routes/pages/TicketDetailPage'));
const AccountPage = lazy(async () => import('@/routes/pages/AccountPage'));
const RegistrationsPage = lazy(async () => import('@/routes/pages/RegistrationsPage'));
const SlaDashboardPage = lazy(async () => import('@/routes/pages/SlaDashboardPage'));
const AllTicketsPage = lazy(async () => import('@/routes/pages/AllTicketsPage'));

async function ensureAuth() {
  try {
    const data = await sessionService.me();
    return data.user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw redirect({ to: '/login' });
    }
    throw error;
  }
}

const rootRoute = createRootRoute({
  component: () => (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<p className="p-8 text-sm text-slate-500">Loading…</p>}>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const authedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authed',
  beforeLoad: async () => {
    const user = await ensureAuth();
    return { user };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const ticketsRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/tickets',
  component: TicketsPage,
});

const ticketSearchRedirectRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/tickets/search',
  beforeLoad: () => {
    throw redirect({ to: '/tickets' });
  },
});

const ticketDetailRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/tickets/$ticketId',
  component: TicketDetailPage,
});

const accountRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/account',
  component: AccountPage,
});

const registrationsRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/users/new',
  beforeLoad: ({ context }) => {
    if (context.user.role.code !== 'admin') {
      throw redirect({ to: '/tickets' });
    }
  },
  component: RegistrationsPage,
});

const slaDashboardRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/sla',
  beforeLoad: ({ context }) => {
    if (context.user.role.code !== 'admin') {
      throw redirect({ to: '/tickets' });
    }
  },
  component: SlaDashboardPage,
});

const allTicketsRoute = createRoute({
  getParentRoute: () => authedRoute,
  path: '/tickets/all',
  beforeLoad: ({ context }) => {
    if (context.user.role.code !== 'admin') {
      throw redirect({ to: '/tickets' });
    }
  },
  component: AllTicketsPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/tickets' });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  authedRoute.addChildren([
    ticketsRoute,
    ticketSearchRedirectRoute,
    allTicketsRoute,
    ticketDetailRoute,
    accountRoute,
    registrationsRoute,
    slaDashboardRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
