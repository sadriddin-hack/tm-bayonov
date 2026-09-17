import React from 'react';
import { MembershipStatus } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface StatusBadgeProps {
  status: MembershipStatus;
  daysRemaining?: number | null;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, daysRemaining, className = '' }) => {
  const { language } = useLanguage();

  let bg = 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
  let dot = 'bg-gray-400';
  let label = status;

  switch (status) {
    case 'ACTIVE':
      bg = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
      dot = 'bg-emerald-500 animate-pulse';
      label = language === 'tj' ? 'ФАЪОЛ' : 'АКТИВЕН';
      break;
    case 'EXPIRING_SOON':
      bg = 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
      dot = 'bg-amber-500';
      label = language === 'tj' ? 'МУҲЛАТАШ НАЗДИК' : 'СКОРО ИСТЕКАЕТ';
      break;
    case 'DEBTOR':
      bg = 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';
      dot = 'bg-rose-500';
      label = language === 'tj' ? 'ҚАРЗДОР' : 'ДОЛЖНИК';
      break;
    case 'EXPIRED':
      bg = 'bg-purple-500/10 text-purple-600 border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/60';
      dot = 'bg-purple-500';
      label = language === 'tj' ? 'МУҲЛАТ ГУЗАШТА' : 'ИСТЕКШИЙ';
      break;
    case 'SUSPENDED':
      bg = 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30 dark:bg-zinc-800 dark:text-zinc-400';
      dot = 'bg-zinc-400';
      label = language === 'tj' ? 'БОЗДОШТА' : 'ПРИОСТАНОВЛЕН';
      break;
    default:
      label = language === 'tj' ? 'ҒАЙРИФАЪОЛ' : 'НЕАКТИВЕН';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border tracking-wide whitespace-nowrap ${bg} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span>{label}</span>
      {daysRemaining !== undefined && daysRemaining !== null && status !== 'DEBTOR' && (
        <span className="opacity-75 text-[11px] font-normal">
          ({daysRemaining > 0 ? `${daysRemaining} р.` : daysRemaining === 0 ? 'имрӯз' : `${Math.abs(daysRemaining)} р. гуз.`})
        </span>
      )}
    </span>
  );
};
