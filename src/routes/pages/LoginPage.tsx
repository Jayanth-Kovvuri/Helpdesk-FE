import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useLogin } from '@/api/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'customer@helpdesk.local', password: 'password123' },
  });

  return (
    <div className="mx-auto mt-16 max-w-md rounded-lg border border-helpdesk-border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">{t('app.login')}</h1>
      <p className="mt-1 text-xs text-slate-500">{t('login.hint')}</p>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          void handleSubmit((values) => {
            login.mutate(values, {
              onSuccess: () => {
                void navigate({ to: '/tickets' });
              },
            });
          })(event);
        }}
      >
        <Input
          label={t('login.email')}
          type="email"
          autoComplete="username"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('login.password')}
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {login.error ? (
          <p className="text-sm text-red-600" role="alert">
            {login.error.message}
          </p>
        ) : null}
        <Button type="submit" disabled={login.isPending}>
          {t('login.submit')}
        </Button>
      </form>
    </div>
  );
}
