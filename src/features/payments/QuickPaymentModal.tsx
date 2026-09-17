import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.js';
import { EnrichedStudent, PaymentMethod } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { api } from '../../api/client.js';
import { CreditCard, ShieldCheck } from 'lucide-react';

interface QuickPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

export const QuickPaymentModal: React.FC<QuickPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [students, setStudents] = useState<EnrichedStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [amount, setAmount] = useState(300);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getStudents({ limit: 100 }).then((res) => {
        setStudents(res.items);
        if (res.items.length > 0 && !selectedStudentId) {
          setSelectedStudentId(res.items[0].id);
          setAmount(res.items[0].monthlyPrice || 300);
        }
      });
    }
  }, [isOpen]);

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const found = students.find((s) => s.id === id);
    if (found) {
      setAmount((found.monthlyPrice || 300) * durationMonths);
    }
  };

  const handleDurationChange = (m: number) => {
    setDurationMonths(m);
    const found = students.find((s) => s.id === selectedStudentId);
    const base = found?.monthlyPrice || 300;
    setAmount(base * m);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.renewMembership({
        studentId: selectedStudentId,
        durationMonths,
        amount: Number(amount),
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      onSuccess(res.paymentId);
      onClose();
    } catch (err: any) {
      setError(err.message || t.errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.receivePaymentTitle} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 text-zinc-900 dark:text-zinc-100">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Select Student */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
            {t.selectStudent} *
          </label>
          <select
            required
            value={selectedStudentId}
            onChange={(e) => handleStudentChange(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName} ({s.studentCode}) • {s.phone} • {s.status}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">
            {t.durationMonth}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 6].map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => handleDurationChange(m)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                  durationMonths === m
                    ? 'bg-red-600 text-white border-red-600 shadow-sm'
                    : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {m} моҳ
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
            {t.amountToPay} (сомонӣ) *
          </label>
          <input
            type="number"
            required
            min="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-black text-lg text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Method */}
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
                className={`py-2 text-xs font-bold rounded-xl border transition-all ${
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
            placeholder="Масалан: Пардохт дар кассаи толор"
            className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500"
          />
        </div>

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
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md tracking-wider disabled:opacity-50 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {isSubmitting ? t.loading : t.btnPayAndRenew}
          </button>
        </div>
      </form>
    </Modal>
  );
};
