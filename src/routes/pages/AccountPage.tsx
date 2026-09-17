import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { queryKeys } from '@/api/queryKeys';
import { useMe, useUpdatePassword } from '@/api/hooks/useAuth';
import { healthService } from '@/api/services/healthService';
import { meService } from '@/api/services/meService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'passwordMismatch',
    path: ['confirmPassword'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function AccountPage() {
  const { t } = useTranslation();
  const { data: user } = useMe();
  const updatePassword = useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const healthQuery = useQuery({
    queryKey: queryKeys.health,
    queryFn: () => healthService.check(),
  });

  const exportMutation = useMutation({
    mutationFn: () => meService.exportData(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data.export, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'helpdesk-export.json';
      anchor.click();
      URL.revokeObjectURL(url);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => meService.deleteAccount(),
    onSuccess: () => {
      window.location.href = '/login';
    },
  });

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">{t('app.account')}</h1>
      {user ? (
        <p className="text-sm text-slate-600">
          {user.email} · {user.role.label}
        </p>
      ) : null}

      <section className="rounded-lg border border-helpdesk-border bg-white p-4 text-sm">
        <h2 className="font-semibold">{t('app.backendHealth')}</h2>
        {healthQuery.isLoading ? (
          <p>{t('app.loading')}</p>
        ) : (
          <pre className="mt-2 overflow-auto rounded bg-slate-50 p-2 text-xs">
            {JSON.stringify(healthQuery.data, null, 2)}
          </pre>
        )}
      </section>

      <section className="rounded-lg border border-helpdesk-border bg-white p-4 text-sm">
        <h2 className="font-semibold">{t('account.changePassword')}</h2>
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            void handleSubmit((values) => {
              updatePassword.mutate(
                { currentPassword: values.currentPassword, newPassword: values.newPassword },
                { onSuccess: () => reset({ currentPassword: '', newPassword: '', confirmPassword: '' }) },
              );
            })(event);
          }}
        >
          <Input
            label={t('account.currentPassword')}
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            label={t('account.newPassword')}
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <Input
            label={t('account.confirmPassword')}
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message ? t('account.passwordMismatch') : undefined}
            {...register('confirmPassword')}
          />
          {updatePassword.error ? (
            <p className="text-sm text-red-600" role="alert">
              {updatePassword.error.message}
            </p>
          ) : null}
          {updatePassword.isSuccess ? (
            <p className="text-sm text-green-700" role="status">
              {t('account.passwordUpdated')}
            </p>
          ) : null}
          <Button type="submit" disabled={updatePassword.isPending}>
            {t('app.save')}
          </Button>
        </form>
      </section>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => exportMutation.mutate()}>
          {t('app.exportData')}
        </Button>

        <Button variant="danger" onClick={() => deleteMutation.mutate()}>
          {t('app.deleteAccount')}
        </Button>
      </div>
    </div>
  );
}
