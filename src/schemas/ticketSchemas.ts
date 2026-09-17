import { z } from 'zod';

export const ticketCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10_000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export const ticketAdminCreateSchema = ticketCreateSchema.extend({
  customer_id: z.coerce.number().optional(),
  assignee_id: z.coerce.number().optional(),
  status: z.enum(['open', 'in_progress', 'pending', 'resolved', 'closed']).optional(),
});

export const ticketCustomerUpdateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10_000),
});

export const ticketAdminUpdateSchema = ticketCustomerUpdateSchema.extend({
  status: z.enum(['open', 'in_progress', 'pending', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assignee_id: z.coerce.number().nullable().optional(),
});

export const commentSchema = z.object({
  body: z.string().min(1).max(10_000),
});

export type TicketCreateForm = z.infer<typeof ticketCreateSchema>;
export type TicketAdminCreateForm = z.infer<typeof ticketAdminCreateSchema>;
export type CommentForm = z.infer<typeof commentSchema>;
