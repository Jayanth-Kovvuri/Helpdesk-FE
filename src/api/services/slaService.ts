import { apiRequest } from '@/api/client';
import type { LabeledCode } from '@/types/api';

export type SlaTicketSummary = {
  id: number;
  title: string;
  priority: LabeledCode<'low' | 'medium' | 'high' | 'urgent'>;
  due_at: string;
};

export type SlaDashboard = {
  counts: {
    breached: number;
    at_risk: number;
    ok: number;
  };
  breached_tickets: SlaTicketSummary[];
  at_risk_tickets: SlaTicketSummary[];
};

export const slaService = {
  dashboard() {
    return apiRequest<SlaDashboard>('/sla_dashboard');
  },
};
