import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Search,
  CreditCard,
  Send,
  CheckCircle2,
  Phone,
  Clock,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { Debt, PaymentMethod } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../api/client.js';
import { Modal } from '../../components/common/Modal.js';

interface DebtorsViewProps {
  onPaySuccess: (paymentId: string) => void;
}

export const DebtorsView: React.FC<DebtorsViewProps> = ({ onPaySuccess }) => {
  const { t } = useLanguage();
  const { canReceivePayments } = useAuth();

  const [debts, setDebts] = useState<Debt[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Settlement Modal state
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState<number>(300);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchDebts = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDebts(search);
      setDebts(res.items || []);
      setTotalCount(res.totalCount || 0);
      setTotalAmount(res.totalAmount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, [search]);

  const handleOpenPayModal = (debt: Debt) => {
    setPayingDebt(debt);
    setPayAmount(debt.amount);
    setPayMethod('CASH');
    setPayNotes('');
  };

  const handleSettleDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebt) return;
    setIsSubmitting(true);
    try {
      const res = await api.payDebt(payingDebt.id, {
        amount: Number(payAmount),
        paymentMethod: payMethod,
        notes: payNotes.trim() || undefined,
      });

      setActionSuccessMsg(`Пардохти қарз бомуваффақият сабт шуд: ${payAmount} сомонӣ`);
      setPayingDebt(null);
      fetchDebts();
      if (res.payment?.id) {
        onPaySuccess(res.payment.id);
      }
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReminder = async (debt: Debt) => {
    try {
      await api.sendNotification({
        studentId: debt.studentId,
        channel: 'SMS',
        type: 'DEBT_REMINDER',
      });
      setActionSuccessMsg(`Паёми ёдраскунӣ ба ${debt.studentName} (${debt.phone}) ирсол карда шуд!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
            {t.debtorsListTitle}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Рӯйхати варзишгароне, ки муҳлати абонементашон гузаштааст ва қарз сабт шудааст
          </p>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t.totalDebtors}
            </span>
            <AlertOctagon className="w-5 h-5" />
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {totalCount} нафар
          </p>
          <span className="text-[11px] text-rose-600/70 font-medium">Шогирдони қарздор</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t.totalDebt}
            </span>
            <Coins className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">
              {totalAmount.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-red-600">{t.currency}</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">Маблағи умумии қарзи ҷорӣ</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Огоҳиномаҳо
            </span>
            <Send className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-zinc-900 dark:text-white mt-2">
            Автоматӣ (SMS)
          </p>
          <span className="text-[11px] text-zinc-400 font-medium">
            Ҳар саҳар ба рақами волидайн ва шогирдон ирсол мешавад
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ҷустуҷӯ аз рӯи номи шогирд ё рақами телефон..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-red-500 font-medium text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      {/* Main Debt Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 text-xs font-bold">{t.loading}</div>
        ) : debts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-zinc-900 dark:text-white font-extrabold text-sm">
              Ҳеҷ қарздоре вуҷуд надорад!
            </p>
            <p className="text-zinc-400 text-xs">Ҳамаи варзишгарон пардохтҳоро пурра супоридаанд.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4">Шогирд</th>
                  <th className="p-4">Телефон</th>
                  <th className="p-4">Санаи пайдоиши қарз</th>
                  <th className="p-4">Рӯзҳои гузашта</th>
                  <th className="p-4">Маблағи қарз</th>
                  <th className="p-4">Ҳолат</th>
                  <th className="p-4 text-right">Амалҳо</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {debts.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                        <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
                          {d.studentName}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 font-mono font-medium text-zinc-600 dark:text-zinc-300">
                      {d.phone}
                    </td>

                    <td className="p-4 font-mono text-zinc-500">{d.dueDate}</td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-lg">
                        <Clock className="w-3 h-3" />
                        {d.daysOverdue} рӯз
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-black text-sm text-rose-600">
                        {d.amount} {t.currency}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-600 text-white">
                        {d.status === 'UNPAID' ? 'СУПОРИДА НАШУДААСТ' : d.status}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSendReminder(d)}
                          title="Ирсоли паёми ёдраскунӣ (SMS)"
                          className="px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Send className="w-3 h-3 text-red-500" />
                          <span>SMS</span>
                        </button>

                        {canReceivePayments && (
                          <button
                            onClick={() => handleOpenPayModal(d)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[11px] rounded-xl shadow-md transition-all flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>{t.btnPayDebt}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Debt Modal */}
      {payingDebt && (
        <Modal
          isOpen={!!payingDebt}
          onClose={() => setPayingDebt(null)}
          title="ҚАБУЛИ ПАРДОХТИ ҚАРЗ (SETTLE DEBT)"
          maxWidth="md"
        >
          <form onSubmit={handleSettleDebt} className="space-y-4 text-zinc-900 dark:text-zinc-100">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl space-y-1">
              <p className="text-xs text-zinc-500">Шогирд:</p>
              <h4 className="font-extrabold text-base">{payingDebt.studentName}</h4>
              <p className="text-xs font-mono text-zinc-400">{payingDebt.phone}</p>
              <p className="text-xs text-rose-600 font-bold mt-2">
                Маблағи қарзи ҷорӣ: {payingDebt.amount} сомонӣ
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
                Маблағи пардохтшаванда (сомонӣ) *
              </label>
              <input
                type="number"
                required
                min="1"
                max={payingDebt.amount}
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-base text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
              />
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Пардохти пурра ё қисмӣ иҷозат аст
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wide">
                {t.paymentMethod}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['CASH', 'CARD', 'BANK_TRANSFER'] as const).map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setPayMethod(method)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      payMethod === method
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {method === 'CASH' ? t.cash : method === 'CARD' ? t.card : t.bankTransfer}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
                {t.notes}
              </label>
              <input
                type="text"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                placeholder="Масалан: Пардохти қарзи моҳи гузашта"
                className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPayingDebt(null)}
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
                {isSubmitting ? t.loading : 'Тасдиқи пардохт'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
