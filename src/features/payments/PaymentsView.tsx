import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Printer,
  Download,
  Calendar,
  DollarSign,
  Plus,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { Payment } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../api/client.js';

interface PaymentsViewProps {
  onViewReceipt: (paymentId: string) => void;
  onOpenQuickPayment: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  onViewReceipt,
  onOpenQuickPayment,
}) => {
  const { t } = useLanguage();
  const { canReceivePayments } = useAuth();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await api.getPayments({
        search,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setPayments(res.items);
      setTotalCount(res.totalCount);
      setTotalAmount(res.totalAmount);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [search, dateFrom, dateTo]);

  // Breakdowns
  const safePayments = payments || [];
  const cashAmount = safePayments
    .filter((p) => p.paymentMethod === 'CASH')
    .reduce((acc, p) => acc + p.amount, 0);

  const cardAmount = safePayments
    .filter((p) => p.paymentMethod === 'CARD' || p.paymentMethod === 'BANK_TRANSFER')
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
            {t.paymentsListTitle}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Таърихи пурраи пардохтҳои қабулшуда, квитансияҳо ва ҳисоботи касса
          </p>
        </div>

        {canReceivePayments && (
          <button
            onClick={onOpenQuickPayment}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.btnReceivePayment}</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Ҳамагӣ пардохтҳо
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">
              {totalAmount.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-red-600">{t.currency}</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">
            {totalCount} амалиёти молиявӣ
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Нақд (Cash)
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-600">
              {cashAmount.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-emerald-600">{t.currency}</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">Дар кассаи қабулгоҳ</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Корт ва Интиқол
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-blue-600">
              {cardAmount.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-blue-600">{t.currency}</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">Корти бонкӣ ва интиқол</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ҷустуҷӯ аз рӯи рақами расид ё шогирд..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-red-500 font-medium text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Аз санаи..."
              className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none focus:border-red-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="То санаи..."
              className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none focus:border-red-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>
      </div>

      {/* Main Payments Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 text-xs font-bold">{t.loading}</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            Ҳеҷ пардохте ёфт нашуд
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4">Рақами расид</th>
                  <th className="p-4">Шогирд</th>
                  <th className="p-4">Сана ва вақт</th>
                  <th className="p-4">Давраи пардохт</th>
                  <th className="p-4">Усули пардохт</th>
                  <th className="p-4">Кассир</th>
                  <th className="p-4">Маблағ</th>
                  <th className="p-4 text-right">Расид (Чоп)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="p-4 font-mono font-bold text-red-600">{p.receiptNumber}</td>
                    <td className="p-4 font-extrabold text-zinc-900 dark:text-white">
                      {p.studentName}
                    </td>
                    <td className="p-4 font-mono text-zinc-500">{p.paymentDate}</td>
                    <td className="p-4 font-medium text-zinc-600 dark:text-zinc-300">
                      {p.membershipPeriod}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md font-bold uppercase text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {p.paymentMethod === 'CASH'
                          ? 'Нақд'
                          : p.paymentMethod === 'CARD'
                          ? 'Корт'
                          : 'Интиқол'}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500">{p.receivedBy}</td>
                    <td className="p-4 font-black text-sm text-zinc-900 dark:text-white">
                      {p.amount.toLocaleString()} TJS
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onViewReceipt(p.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs rounded-xl transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Чоп</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
