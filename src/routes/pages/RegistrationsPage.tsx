import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useCreateUser, useSetUserDisabled, useUsersList, useUserSearch } from '@/api/hooks/useUsers';
import { useMe } from '@/api/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/cn';
import { filterUsersClient } from '@/lib/filterUsersClient';
import { selectFieldClass } from '@/lib/selectFieldClass';

const SEARCH_DEBOUNCE_MS = 300;

const registrationSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(['customer', 'admin']),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegistrationsPage() {
  const { t } = useTranslation();
  const { data: currentUser } = useMe();
  const isAdmin = currentUser?.role.code === 'admin';
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout>();
  const pageSize = 5;

  const usersQuery = useUsersList(isAdmin);
  const createUser = useCreateUser();
  const setUserDisabled = useSetUserDisabled();
  const { toasts, removeToast, showSuccess } = useToast();

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { email: '', name: '', password: '', role: 'customer' },
  });

  const useServerSearch = debouncedSearch.trim().length >= 2;
  const searchQuery_result = useUserSearch(debouncedSearch);
  const listUsers = usersQuery.data ?? [];

  const allUsers = useServerSearch
    ? (searchQuery_result.data ?? filterUsersClient(listUsers, searchQuery))
    : filterUsersClient(listUsers, searchQuery);

  const showListLoading = usersQuery.isLoading && listUsers.length === 0;
  const shouldSearch = searchQuery.trim().length > 0;

  const totalPages = Math.ceil(allUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = allUsers.slice(startIndex, startIndex + pageSize);

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
                  reset({ email: '', name: '', password: '', role: 'customer' });
                  showSuccess(t('users.createSuccess'));
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
            label={t('users.name')}
            type="text"
            autoComplete="off"
            error={errors.name?.message}
            {...register('name')}
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
              className={cn(selectFieldClass, 'mt-1 w-full')}
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
          <Button type="submit" disabled={createUser.isPending}>
            {t('users.create')}
          </Button>
        </form>
      </section>

      <section className="rounded-lg border border-helpdesk-border bg-white p-4">
        <h2 className="font-semibold">{t('users.listTitle')}</h2>
        <div className="mt-3 mb-4">
          <input
            type="text"
            placeholder={t('app.search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-md border border-helpdesk-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-helpdesk-primary"
          />
        </div>
        {showListLoading ? (
          <p className="mt-2 text-sm text-slate-500">{t('app.loading')}</p>
        ) : (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-helpdesk-border bg-slate-50">
                    <th className="px-4 py-2 text-left font-medium text-slate-700">{t('users.name')}</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">{t('users.email')}</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">{t('users.role')}</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">{t('users.status')}</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-700">{t('app.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-helpdesk-border hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{user.name}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-slate-600">{user.role.label}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            user.disabled
                              ? 'rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700'
                              : 'rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700'
                          }
                        >
                          {user.disabled ? t('users.statusDisabled') : t('users.statusActive')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {user.id === currentUser?.id ? (
                          <span className="text-xs text-slate-500">{t('users.currentUser')}</span>
                        ) : (
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {allUsers.length === 0 ? (
              <p className="mt-4 text-center text-sm text-slate-500">
                {shouldSearch ? t('users.noSearchResults') : t('users.noUsers')}
              </p>
            ) : null}

            {totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  {t('app.showing')} {startIndex + 1}-{Math.min(startIndex + pageSize, allUsers.length)} {t('app.of')}{' '}
                  {allUsers.length}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    {t('app.previous')}
                  </Button>
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-sm text-slate-600">
                      {currentPage} / {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    {t('app.next')}
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
