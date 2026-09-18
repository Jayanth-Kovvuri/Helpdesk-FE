import { useTranslation } from 'react-i18next';

import { Modal } from '@/components/ui/Modal';
import { SLA_THRESHOLDS_BY_PRIORITY } from '@/lib/slaThresholds';

type SlaLogicModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SlaLogicModal({ open, onClose }: SlaLogicModalProps) {
  const { t } = useTranslation();

  const priorityLabels = {
    urgent: t('tickets.priorityUrgent'),
    high: t('tickets.priorityHigh'),
    medium: t('tickets.priorityMedium'),
    low: t('tickets.priorityLow'),
  } as const;

  return (
    <Modal open={open} title={t('sla.infoTitle')} onClose={onClose} className="max-w-xl">
      <div className="space-y-4 text-sm text-slate-700">
        <p>{t('sla.infoIntro')}</p>

        <ul className="list-disc space-y-2 ps-5">
          <li>{t('sla.infoOnTrack')}</li>
          <li>{t('sla.infoAtRisk')}</li>
          <li>{t('sla.infoBreached')}</li>
        </ul>

        <p className="text-slate-600">{t('sla.infoDue')}</p>

        <div className="overflow-x-auto rounded-md border border-helpdesk-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">{t('sla.infoPriority')}</th>
                <th className="px-3 py-2 font-medium">{t('sla.infoOnTrackWindow')}</th>
                <th className="px-3 py-2 font-medium">{t('sla.infoAtRiskWindow')}</th>
                <th className="px-3 py-2 font-medium">{t('sla.infoBreachedAfter')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SLA_THRESHOLDS_BY_PRIORITY.map((row) => (
                <tr key={row.code}>
                  <td className="px-3 py-2 font-medium">{priorityLabels[row.code]}</td>
                  <td className="px-3 py-2">{t('sla.infoDaysOrLess', { days: row.atRiskDays })}</td>
                  <td className="px-3 py-2">
                    {t('sla.infoDaysRange', {
                      from: row.atRiskDays,
                      to: row.slaDays,
                    })}
                  </td>
                  <td className="px-3 py-2">{t('sla.infoDaysOver', { days: row.slaDays })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-500">{t('sla.infoNote')}</p>
      </div>
    </Modal>
  );
}
