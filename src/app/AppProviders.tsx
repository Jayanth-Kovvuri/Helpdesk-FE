import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

import { queryClient } from '@/app/queryClient';
import i18n from '@/i18n';
import { router } from '@/routes/router';
import { useUiStore } from '@/stores/uiStore';

function I18nSync({ children }: { children: React.ReactNode }) {
  const locale = useUiStore((state) => state.locale);
  const direction = useUiStore((state) => state.direction);

  useEffect(() => {
    void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  return <>{children}</>;
}

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <I18nSync>
          <RouterProvider router={router} />
        </I18nSync>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
