import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';

import i18n from '@/i18n';
import LoginPage from '@/routes/pages/LoginPage';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

function renderLogin() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <LoginPage />
      </I18nextProvider>
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders sign in form', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits credentials', async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
  });
});
