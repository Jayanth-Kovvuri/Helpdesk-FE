import type { LabeledCode } from '@/types/api';

interface PriorityPillProps {
  priority: LabeledCode<'low' | 'medium' | 'high' | 'urgent'>;
}

export function PriorityPill({ priority }: PriorityPillProps) {
  const colorClasses = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    urgent: 'bg-red-100 text-red-800 border-red-300',
  }[priority.code];

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClasses}`}>
      {priority.label}
    </span>
  );
}
