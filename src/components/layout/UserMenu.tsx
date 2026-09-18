import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLogout } from '@/api/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import type { User } from '@/types/api';

type UserMenuProps = {
  user: User;
};

export function UserMenu({ user }: UserMenuProps) {
  const { t } = useTranslation();
  const logout = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-helpdesk-primary text-sm font-semibold text-white hover:opacity-90"
        aria-label="User menu"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute end-0 top-full mt-2 w-56 rounded-lg border border-helpdesk-border bg-white shadow-lg">
          <div className="border-b border-helpdesk-border px-4 py-3">
            <div className="font-semibold text-slate-900">{user.name}</div>
            <div className="text-xs text-slate-500">{user.email}</div>
          </div>

          <div className="p-2">
            <Button
              className="w-full justify-center"
              onClick={() => {
                void logout.mutateAsync().then(() => {
                  window.location.href = '/login';
                });
              }}
            >
              {t('app.logout')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
