/** Mirrors Helpdesk Rails Blueprinter enums — used in Phase 1 demos only. */

export type LabeledCode<T extends string> = {
  code: T;
  label: string;
};

export type TicketStatus = LabeledCode<
  'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
>;

export type TicketPriority = LabeledCode<'low' | 'medium' | 'high' | 'urgent'>;

export type TicketPreview = {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
};
