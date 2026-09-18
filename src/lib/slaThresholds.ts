/** Mirrors Helpdesk `TicketSla::SLA_THRESHOLDS_BY_PRIORITY` (days). */
export const SLA_THRESHOLDS_BY_PRIORITY = [
  { code: 'urgent' as const, slaDays: 2, atRiskDays: 1 },
  { code: 'high' as const, slaDays: 3, atRiskDays: 2 },
  { code: 'medium' as const, slaDays: 5, atRiskDays: 3 },
  { code: 'low' as const, slaDays: 7, atRiskDays: 5 },
];
