import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useMe } from '@/api/hooks/useAuth';
import { useAttachments, useDeleteAttachment, useUploadAttachment } from '@/api/hooks/useAttachments';
import { useComments, useCreateComment, useDeleteComment } from '@/api/hooks/useComments';
import { useAllTags, useAttachTag, useDetachTag } from '@/api/hooks/useTags';
import { useDeleteTicket, useTicket, useUpdateTicket } from '@/api/hooks/useTickets';
import { AttachmentRow } from '@/components/attachments/AttachmentRow';
import { Button } from '@/components/ui/Button';
import { FilePickButton } from '@/components/ui/FilePickButton';
import { cn } from '@/lib/cn';
import { selectFieldClass } from '@/lib/selectFieldClass';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Input } from '@/components/ui/Input';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';
import {
  commentSchema,
  ticketAdminUpdateSchema,
  ticketCustomerUpdateSchema,
  type CommentForm,
} from '@/schemas/ticketSchemas';

export default function TicketDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { ticketId } = useParams({ strict: false });
  const id = Number.parseInt(ticketId ?? '0', 10);
  const { data: user } = useMe();
  const { toasts, removeToast, showSuccess, showError } = useToast();
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
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [attachmentUploadClear, setAttachmentUploadClear] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        <div>
          <h1 className="text-2xl font-semibold">{ticket.title}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('app.createdAt', { date: new Date(ticket.created_at).toLocaleString() })}
          </p>
        </div>
        {isAdmin ? (
          <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
            {t('app.delete')}
          </Button>
        ) : null}
      </div>

      <section className="rounded-lg border border-helpdesk-border bg-white p-4">
        <h2 className="font-semibold">{t('app.attachments')}</h2>
        {(attachmentsQuery.data?.length ?? 0) === 0 ? (
          <p className="mt-2 text-sm text-slate-500">{t('attachments.empty')}</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {(attachmentsQuery.data ?? []).map((file) => (
              <AttachmentRow
                key={file.id}
                file={file}
                deleteLabel={t('app.delete')}
                canDelete={Boolean(user && (file.uploaded_by?.id === user.id || isAdmin))}
                onDelete={() => {
                  deleteAttachment.mutate(file.id, {
                    onSuccess: () => {
                      showSuccess(t('app.attachmentDeleted'));
                    },
                    onError: () => {
                      showError(t('app.error'));
                    },
                  });
                }}
              />
            ))}
          </ul>
        )}
        <FilePickButton
          className="mt-3"
          label={t('attachments.addFile')}
          clearSignal={attachmentUploadClear}
          onFileSelected={(files) => {
            const file = files[0];
            if (!file) return;
            uploadAttachment.mutate(file, {
              onSuccess: () => {
                showSuccess(t('app.attachmentUploaded'));
                setAttachmentUploadClear((value) => value + 1);
              },
              onError: () => {
                showError(t('app.error'));
              },
            });
          }}
        />
      </section>

      <FormProvider {...form}>
        <form
          className="space-y-3 rounded-lg border border-helpdesk-border bg-white p-4"
          onSubmit={(event) => {
            void form.handleSubmit((values) => {
              updateTicket.mutate(values, {
                onSuccess: () => {
                  showSuccess(t('app.ticketUpdated'));
                },
                onError: () => {
                  showError(t('app.error'));
                },
              });
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
                <select className={cn(selectFieldClass, 'mt-1 w-full')} {...form.register('status')}>
                  {(['open', 'in_progress', 'pending', 'resolved', 'closed'] as const).map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Priority
                <select className={cn(selectFieldClass, 'mt-1 w-full')} {...form.register('priority')}>
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
                    detachTag.mutate(tag.id, {
                      onSuccess: () => {
                        showSuccess(t('app.tagRemoved'));
                      },
                      onError: () => {
                        showError(t('app.error'));
                      },
                    });
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
                  showSuccess(t('app.tagAdded'));
                },
                onError: () => {
                  showError(t('app.error'));
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
              {(comment.attachments?.length ?? 0) > 0 ? (
                <ul className="mt-2 space-y-2">
                  {comment.attachments?.map((file) => (
                    <AttachmentRow key={file.id} file={file} deleteLabel={t('app.delete')} canDelete={false} compact />
                  ))}
                </ul>
              ) : null}
              <p className="mt-1 text-xs text-slate-500">{comment.author.email}</p>
              {user && (user.id === comment.author.id || isAdmin) ? (
                <Button
                  variant="secondary"
                  className="mt-1"
                  onClick={() => {
                    deleteComment.mutate(comment.id, {
                      onSuccess: () => {
                        showSuccess(t('app.commentDeleted'));
                      },
                      onError: () => {
                        showError(t('app.error'));
                      },
                    });
                  }}
                >
                  {t('app.delete')}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
        <form
          className="mt-3 space-y-2"
          onSubmit={(event) => {
            void commentForm.handleSubmit((values) => {
              createComment.mutate(
                { body: values.body, file: commentFile ?? undefined },
                {
                  onSuccess: () => {
                    commentForm.reset();
                    setCommentFile(null);
                    showSuccess(t('app.commentCreated'));
                  },
                  onError: () => {
                    showError(t('app.error'));
                  },
                },
              );
            })(event);
          }}
        >
          <input
            className="w-full rounded-md border border-helpdesk-border px-3 py-2 text-sm"
            placeholder={t('comments.placeholder')}
            {...commentForm.register('body')}
          />
          <FilePickButton
            label={t('attachments.addFile')}
            selectedFileName={commentFile?.name}
            onFileSelected={(files) => {
              setCommentFile(files[0] ?? null);
            }}
          />
          <Button type="submit">{t('app.create')}</Button>
        </form>
      </section>

      <ConfirmationModal
        open={showDeleteConfirm}
        title={t('app.deleteTicketTitle')}
        message={t('app.deleteTicketMessage')}
        confirmText={t('app.delete')}
        cancelText={t('app.cancel')}
        isDangerous
        isLoading={deleteTicket.isPending}
        onConfirm={() => {
          deleteTicket.mutate(id, {
            onSuccess: () => {
              setShowDeleteConfirm(false);
              showSuccess(t('app.ticketDeleted'));
              setTimeout(() => {
                void router.navigate({ to: '/tickets' });
              }, 4000);
            },
            onError: () => {
              setShowDeleteConfirm(false);
              showError(t('app.error'));
            },
          });
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
