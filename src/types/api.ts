export type LabeledCode<T extends string> = {
  code: T;
  label: string;
};

export type User = {
  id: number;
  email: string;
  name: string;
  role: LabeledCode<'customer' | 'admin'>;
  disabled: boolean;
};

export type TicketStatus = LabeledCode<
  'open' | 'in_progress' | 'pending' | 'resolved' | 'closed'
>;

export type TicketPriority = LabeledCode<'low' | 'medium' | 'high' | 'urgent'>;

export type Tag = {
  id: number;
  name: string;
};

export type Ticket = {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  comments_count?: number;
  attachments_count?: number;
  customer: User;
  assignee: User | null;
  tags: Tag[];
};

export type Comment = {
  id: number;
  body: string;
  created_at: string;
  updated_at: string;
  author: User;
  attachments?: Attachment[];
};

export type Attachment = {
  id: number;
  filename: string;
  content_type: string;
  byte_size: number;
  url: string;
  uploaded_by: User | null;
};

export type ApiErrorBody = {
  error?: string;
  errors?: string[];
};
