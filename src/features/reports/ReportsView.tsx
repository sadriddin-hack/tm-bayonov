import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Coins,
  CreditCard,
  Users,
  Printer,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { api } from '../../api/client.js';

export const ReportsView: React.FC = () => {
  const { t } = useLanguage();
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api
      .getFinanceReport()
      .then(setReportData)
      .finally(() => setIsLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !reportData) {
    return (
      <div className="p-12 text-center text-zinc-400 text-xs font-bold">{t.loading}</div>
    );
  }

  const { stats, methodBreakdown, recentPayments } = reportData;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
            {t.reportsTitle}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Таҳлили фаъолияти молиявӣ, гардиши маблағҳо ва омори узвияти варзишгарон
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-800 hover:bg-black text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Чопи ҳисобот</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Даромади умумӣ
          </span>
          <p className="text-3xl font-black text-zinc-900 dark:text-white mt-2">
            {stats.totalRevenue.toLocaleString()} {t.currency}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Таърихи пурра
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Даромади ин моҳ
          </span>
          <p className="text-3xl font-black text-red-600 mt-2">
            {stats.monthlyRevenue.toLocaleString()} {t.currency}
          </p>
          <span className="text-[11px] text-zinc-400 font-medium">Сентябри 2026</span>
        </div>

        <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Даромади имрӯза
          </span>
          <p className="text-3xl font-black text-zinc-900 dark:text-white mt-2">
            {stats.todayRevenue.toLocaleString()} {t.currency}
          </p>
          <span className="text-[11px] text-zinc-400 font-medium">Имрӯз, 17 Сентябр</span>
        </div>

        <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
            Қарзи ҷамъшуда
          </span>
          <p className="text-3xl font-black text-rose-600 mt-2">
            {stats.totalDebt.toLocaleString()} {t.currency}
          </p>
          <span className="text-[11px] text-rose-600/70 font-medium">
            {stats.debtorsCount} варзишгар
          </span>
        </div>
      </div>

      {/* Payment methods comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-zinc-900 dark:text-white">
            Тақсимоти усули пардохт (Cash vs Digital)
          </h3>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-zinc-500">Нақд (Cash):</span>
                <span className="text-zinc-900 dark:text-white">
                  {methodBreakdown.cash.toLocaleString()} сомонӣ
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.round(
                      (methodBreakdown.cash / (stats.totalRevenue || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-zinc-500">Корти бонкӣ (Card):</span>
                <span className="text-zinc-900 dark:text-white">
                  {methodBreakdown.card.toLocaleString()} сомонӣ
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${Math.round(
                      (methodBreakdown.card / (stats.totalRevenue || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-zinc-500">Интиқоли бонкӣ (Transfer):</span>
                <span className="text-zinc-900 dark:text-white">
                  {methodBreakdown.transfer.toLocaleString()} сомонӣ
                </span>
              </div>
              <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{
                    width: `${Math.round(
                      (methodBreakdown.transfer / (stats.totalRevenue || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-zinc-900 dark:text-white">
            Маълумотнома барои роҳбарият
          </h3>

          <div className="space-y-3 text-xs text-zinc-600 dark:text-zinc-400">
            <p>
              • Толори <strong>TM BAYONOV MMA</strong> дар реҷаи муқаррарӣ фаъолият намуда, сатҳи миёнаи иштироки варзишгарон <strong>88%</strong>-ро ташкил медиҳад.
            </p>
            <p>
              • Ҳамаи пардохтҳо тариқи квитансияи рақамӣ сабт гашта, ба волидайни шогирдони зери синни 18 огоҳиномаи автоматии SMS ирсол мегардад.
            </p>
            <p>
              • Барои коҳиш додани ҳаҷми қарздорон, система ҳар рӯз соати 08:00 ба телефони шогирдон ёдраскуниҳои автоматӣ ирсол менамояд.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
