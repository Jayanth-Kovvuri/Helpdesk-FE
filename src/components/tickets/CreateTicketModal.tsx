import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useCreateTicket } from '@/api/hooks/useTickets';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ticketCreateSchema, type TicketCreateForm } from '@/schemas/ticketSchemas';

type CreateTicketModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateTicketModal({ open, onClose }: CreateTicketModalProps) {
  const { t } = useTranslation();
  const createTicket = useCreateTicket();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketCreateForm>({
    resolver: zodResolver(ticketCreateSchema),
    defaultValues: { title: '', description: '', priority: 'medium' },
  });

  const closeAndReset = () => {
    reset();
    onClose();
  };

  return (
    <Modal open={open} title={t('app.newTicket')} onClose={closeAndReset}>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          void handleSubmit((values) => {
            createTicket.mutate(values, {
              onSuccess: () => closeAndReset(),
            });
          })(event);
        }}
      >
        <Input label={t('tickets.formTitle')} error={errors.title?.message} {...register('title')} />
        <label className="block text-sm font-medium text-slate-700">
          {t('tickets.priority')}
          <select
            className="mt-1 w-full rounded-md border border-helpdesk-border px-3 py-2 text-sm"
            {...register('priority')}
          >
            <option value="low">{t('tickets.priorityLow')}</option>
            <option value="medium">{t('tickets.priorityMedium')}</option>
            <option value="high">{t('tickets.priorityHigh')}</option>
            <option value="urgent">{t('tickets.priorityUrgent')}</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          {t('tickets.formDescription')}
          <textarea
            className="mt-1 w-full rounded-md border border-helpdesk-border px-3 py-2 text-sm"
            rows={4}
            {...register('description')}
          />
          {errors.description?.message ? (
            <span className="text-xs text-red-600">{errors.description.message}</span>
          ) : null}
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={closeAndReset}>
            {t('app.cancel')}
          </Button>
          <Button type="submit" disabled={createTicket.isPending}>
            {t('app.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
