import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.js';
import { EnrichedStudent, Student, PaymentMethod } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { api } from '../../api/client.js';
import { Calendar, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';

interface RenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: EnrichedStudent | Student | null;
  onRenewSuccess: (result: { paymentId: string }) => void;
}

export const RenewalModal: React.FC<RenewalModalProps> = ({
  isOpen,
  onClose,
  student,
  onRenewSuccess,
}) => {
  const { t } = useLanguage();
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [amount, setAmount] = useState<number>(300);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize price when student changes
  useEffect(() => {
    if (student) {
      const basePrice = student.monthlyPrice || 300;
      setAmount(basePrice * durationMonths);
    }
  }, [student, durationMonths]);

  if (!student) return null;

  // Compute projected new expiration date
  const isEnriched = 'status' in student;
  const currentStatus = isEnriched ? (student as EnrichedStudent).status : 'ACTIVE';
  const currentEndDate = isEnriched ? (student as EnrichedStudent).endDate : '2026-09-17';
  const daysRemaining = isEnriched ? (student as EnrichedStudent).daysRemaining ?? 0 : 30;

  const calculateProjectedEndDate = (months: number): string => {
    const baseDateStr =
      (currentStatus === 'ACTIVE' || currentStatus === 'EXPIRING_SOON') && daysRemaining >= 0 && currentEndDate
        ? currentEndDate
        : '2026-09-17';

    const [y, m, d] = baseDateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setMonth(date.getMonth() + months);
    const resY = date.getFullYear();
    const resM = String(date.getMonth() + 1).padStart(2, '0');
    const resD = String(date.getDate()).padStart(2, '0');
    return `${resD}.${resM}.${resY}`;
  };

  const projectedDateDisplay = calculateProjectedEndDate(durationMonths);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.renewMembership({
        studentId: student.id,
        durationMonths,
        amount: Number(amount),
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      onRenewSuccess({ paymentId: res.paymentId });
      onClose();
    } catch (err: any) {
      setError(err.message || t.errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.renewalTitle} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-5 text-zinc-900 dark:text-zinc-100">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Student Summary Banner */}
        <div className="p-4 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl flex items-center justify-between border border-zinc-200 dark:border-zinc-700/60">
          <div>
            <h4 className="font-extrabold text-sm">{student.fullName}</h4>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">{student.studentCode} • {student.phone}</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] uppercase font-bold text-zinc-400">{t.currentExpiration}:</span>
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {currentEndDate || '17.09.2026'}
            </p>
          </div>
        </div>

        {/* Notice on remaining days logic */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs flex items-start gap-2.5 text-amber-700 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {daysRemaining >= 0 ? t.renewNoticeActive : t.renewNoticeExpired}
          </span>
        </div>

        {/* Duration Select */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">
            {t.durationMonth}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { m: 1, label: t.oneMonth },
              { m: 2, label: t.twoMonths },
              { m: 3, label: t.threeMonths },
              { m: 6, label: t.sixMonths },
              { m: 12, label: t.twelveMonths },
            ].map((d) => (
              <button
                type="button"
                key={d.m}
                onClick={() => setDurationMonths(d.m)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  durationMonths === d.m
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projected New Expiration Card */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
                {t.newExpiration}
              </p>
              <p className="text-base font-extrabold text-zinc-900 dark:text-white">
                {projectedDateDisplay}
              </p>
            </div>
          </div>
        </div>

        {/* Amount to pay */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
            {t.amountToPay}
          </label>
          <div className="relative">
            <input
              type="number"
              required
              min="0"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full pl-4 pr-16 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-base text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-xs text-zinc-400">
              TJS
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">
            {t.paymentMethod}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'CASH', label: t.cash },
              { id: 'CARD', label: t.card },
              { id: 'BANK_TRANSFER', label: t.bankTransfer },
            ].map((method) => (
              <button
                type="button"
                key={method.id}
                onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                  paymentMethod === method.id
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
                    : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
            {t.notes}
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Масалан: Саривақт супорид"
            className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Submit */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all tracking-wider disabled:opacity-50 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {isSubmitting ? t.loading : t.btnPayAndRenew}
          </button>
        </div>
      </form>
    </Modal>
  );
};
