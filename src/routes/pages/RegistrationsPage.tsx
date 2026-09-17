import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useCreateUser, useSetUserDisabled, useUsersList } from '@/api/hooks/useUsers';
import { useMe } from '@/api/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['customer', 'admin']),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegistrationsPage() {
  const { t } = useTranslation();
  const { data: currentUser } = useMe();
  const isAdmin = currentUser?.role.code === 'admin';

  const usersQuery = useUsersList(isAdmin);
  const createUser = useCreateUser();
  const setUserDisabled = useSetUserDisabled();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { email: '', password: '', role: 'customer' },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">{t('users.title')}</h1>

      <section className="rounded-lg border border-helpdesk-border bg-white p-4">
        <h2 className="font-semibold">{t('users.createTitle')}</h2>
        <p className="mt-1 text-xs text-slate-500">{t('users.createHint')}</p>

        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            void handleSubmit((values) => {
              createUser.mutate(values, {
                onSuccess: () => {
                  reset({ email: '', password: '', role: 'customer' });
                },
              });
            })(event);
          }}
        >
          <Input
            label={t('users.email')}
            type="email"
            autoComplete="off"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label={t('users.password')}
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <label className="block text-sm font-medium text-slate-700">
            {t('users.role')}
            <select
              className="mt-1 w-full rounded-md border border-helpdesk-border px-3 py-2 text-sm"
              {...register('role')}
            >
              <option value="customer">{t('users.roleCustomer')}</option>
              <option value="admin">{t('users.roleAdmin')}</option>
            </select>
          </label>

          {createUser.error ? (
            <p className="text-sm text-red-600" role="alert">
              {createUser.error.message}
            </p>
          ) : null}
          {createUser.isSuccess ? (
            <p className="text-sm text-green-700" role="status">
              {t('users.createSuccess')}
            </p>
          ) : null}

          <Button type="submit" disabled={createUser.isPending}>
            {t('users.create')}
          </Button>
        </form>
      </section>

      <section className="rounded-lg border border-helpdesk-border bg-white p-4">
        <h2 className="font-semibold">{t('users.listTitle')}</h2>
        {usersQuery.isLoading ? (
          <p className="mt-2 text-sm text-slate-500">{t('app.loading')}</p>
        ) : (
          <ul className="mt-2 divide-y divide-helpdesk-border text-sm">
            {usersQuery.data?.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-3 py-2">
                <span>{user.email}</span>
                <span className="flex items-center gap-2">
                  <span className="text-slate-500">{user.role.label}</span>
                  <span
                    className={
                      user.disabled
                        ? 'rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700'
                        : 'rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700'
                    }
                  >
                    {user.disabled ? t('users.statusDisabled') : t('users.statusActive')}
                  </span>
                  {user.id === currentUser?.id ? null : (
                    <Button
                      variant="secondary"
                      disabled={setUserDisabled.isPending}
                      onClick={() => {
                        setUserDisabled.mutate({ userId: user.id, disabled: !user.disabled });
                      }}
                    >
                      {user.disabled ? t('users.enable') : t('users.disable')}
                    </Button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
