import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useMe } from '@/api/hooks/useAuth';
import { useAttachments, useDeleteAttachment, useUploadAttachment } from '@/api/hooks/useAttachments';
import { useComments, useCreateComment, useDeleteComment } from '@/api/hooks/useComments';
import { useAllTags, useAttachTag, useDetachTag } from '@/api/hooks/useTags';
import { useDeleteTicket, useTicket, useUpdateTicket } from '@/api/hooks/useTickets';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  commentSchema,
  ticketAdminUpdateSchema,
  ticketCustomerUpdateSchema,
  type CommentForm,
} from '@/schemas/ticketSchemas';

export default function TicketDetailPage() {
  const { t } = useTranslation();
  const { ticketId } = useParams({ strict: false });
  const id = Number.parseInt(ticketId ?? '0', 10);
  const { data: user } = useMe();
  const ticketQuery = useTicket(id);
  const updateTicket = useUpdateTicket(id);
  const deleteTicket = useDeleteTicket();
  const commentsQuery = useComments(id);
  const createComment = useCreateComment(id);
  const deleteComment = useDeleteComment(id);
  const attachmentsQuery = useAttachments(id);
  const uploadAttachment = useUploadAttachment(id);
  const deleteAttachment = useDeleteAttachment(id);
  const allTagsQuery = useAllTags();
  const attachTag = useAttachTag(id);
  const detachTag = useDetachTag(id);
  const [newTagName, setNewTagName] = useState('');

  const isAdmin = user?.role.code === 'admin';
  const schema = isAdmin ? ticketAdminUpdateSchema : ticketCustomerUpdateSchema;

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
  });

  const commentForm = useForm<CommentForm>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: '' },
  });

  useEffect(() => {
    if (ticketQuery.data) {
      form.reset({
        title: ticketQuery.data.title,
        description: ticketQuery.data.description,
        ...(isAdmin
          ? {
              status: ticketQuery.data.status.code,
              priority: ticketQuery.data.priority.code,
              assignee_id: ticketQuery.data.assignee?.id ?? null,
            }
          : {}),
      });
    }
  }, [ticketQuery.data, form, isAdmin]);

  if (ticketQuery.isLoading) return <p>{t('app.loading')}</p>;
  if (ticketQuery.isError || !ticketQuery.data) {
    return <p role="alert">{ticketQuery.error?.message ?? t('app.error')}</p>;
  }

  const ticket = ticketQuery.data;
  const canManageTags = isAdmin || ticket.status.code !== 'closed';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{ticket.title}</h1>
        {isAdmin ? (
          <Button
            variant="danger"
            onClick={() => {
              deleteTicket.mutate(id, {
                onSuccess: () => {
                  window.location.href = '/tickets';
                },
              });
            }}
          >
            {t('app.delete')}
          </Button>
        ) : null}
      </div>

      <FormProvider {...form}>
        <form
          className="space-y-3 rounded-lg border border-helpdesk-border bg-white p-4"
          onSubmit={(event) => {
            void form.handleSubmit((values) => {
              updateTicket.mutate(values);
            })(event);
          }}
        >
          <Input label="Title" {...form.register('title')} error={form.formState.errors.title?.message} />
          <label className="block text-sm font-medium">
            Description
            <textarea
              className="mt-1 w-full rounded-md border border-helpdesk-border px-3 py-2 text-sm"
              rows={4}
              {...form.register('description')}
            />
          </label>
          {isAdmin ? (
            <>
              <label className="block text-sm font-medium">
                Status
                <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" {...form.register('status')}>
                  {(['open', 'in_progress', 'pending', 'resolved', 'closed'] as const).map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Priority
                <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm" {...form.register('priority')}>
                  {(['low', 'medium', 'high', 'urgent'] as const).map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label="Assignee user id (admin)"
                type="number"
                {...form.register('assignee_id')}
              />
            </>
          ) : null}
          <Button type="submit">{t('app.save')}</Button>
        </form>
      </FormProvider>

      <section className="rounded-lg border border-helpdesk-border bg-white p-4">
        <h2 className="font-semibold">{t('tags.title')}</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {ticket.tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
            >
              {tag.name}
              {canManageTags ? (
                <button
                  type="button"
                  aria-label={t('tags.remove', { name: tag.name })}
                  className="text-blue-400 hover:text-blue-700"
                  onClick={() => {
                    detachTag.mutate(tag.id);
                  }}
                >
                  ×
                </button>
              ) : null}
            </li>
          ))}
          {ticket.tags.length === 0 ? <li className="text-xs text-slate-500">{t('tags.empty')}</li> : null}
        </ul>
        {canManageTags ? (
          <form
            className="mt-3 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              const name = newTagName.trim();
              if (!name) return;
              attachTag.mutate(name, {
                onSuccess: () => {
                  setNewTagName('');
                },
              });
            }}
          >
            <input
              className="flex-1 rounded-md border border-helpdesk-border px-3 py-2 text-sm"
              placeholder={t('tags.addPlaceholder')}
              list="all-tag-names"
              value={newTagName}
              onChange={(event) => {
                setNewTagName(event.target.value);
              }}
            />
            <datalist id="all-tag-names">
              {(allTagsQuery.data ?? []).map((tag) => (
                <option key={tag.id} value={tag.name} />
              ))}
            </datalist>
            <Button type="submit" disabled={attachTag.isPending}>
              {t('tags.add')}
            </Button>
          </form>
        ) : null}
      </section>

      <section className="rounded-lg border border-helpdesk-border bg-white p-4">
        <h2 className="font-semibold">{t('app.comments')}</h2>
        <p className="text-xs text-slate-500">
          {(commentsQuery.data?.length ?? 0) === 1
            ? t('app.commentCountSingular', { count: 1 })
            : t('app.commentCountPlural', { count: commentsQuery.data?.length ?? 0 })}
        </p>
        <ul className="mt-3 space-y-2">
          {(commentsQuery.data ?? []).map((comment) => (
            <li key={comment.id} className="rounded bg-slate-50 p-2 text-sm">
              <p>{comment.body}</p>
              <p className="text-xs text-slate-500">{comment.author.email}</p>
              {user && (user.id === comment.author.id || isAdmin) ? (
                <Button
                  variant="secondary"
                  className="mt-1"
                  onClick={() => deleteComment.mutate(comment.id)}
                >
                  {t('app.delete')}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(event) => {
            void commentForm.handleSubmit((values) => {
              createComment.mutate(values.body, {
                onSuccess: () => commentForm.reset(),
              });
            })(event);
          }}
        >
          <input
            className="flex-1 rounded-md border border-helpdesk-border px-3 py-2 text-sm"
            placeholder="Comment…"
            {...commentForm.register('body')}
          />
          <Button type="submit">{t('app.create')}</Button>
        </form>
      </section>

      <section className="rounded-lg border border-helpdesk-border bg-white p-4">
        <h2 className="font-semibold">{t('app.attachments')}</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {(attachmentsQuery.data ?? []).map((file) => (
            <li key={file.id} className="flex items-center justify-between gap-2">
              <a href={file.url} target="_blank" rel="noreferrer" className="text-helpdesk-primary hover:underline">
                {file.filename}
              </a>
              <Button variant="secondary" onClick={() => deleteAttachment.mutate(file.id)}>
                {t('app.delete')}
              </Button>
            </li>
          ))}
        </ul>
        <input
          type="file"
          className="mt-3 text-sm"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) uploadAttachment.mutate(file);
          }}
        />
      </section>
    </div>
  );
}
