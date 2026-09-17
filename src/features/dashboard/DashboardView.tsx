import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertOctagon,
  TrendingUp,
  CreditCard,
  CalendarCheck,
  PlusCircle,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Send,
  Printer,
  Sparkles,
  Zap,
} from 'lucide-react';
import { DashboardOverview, Payment, Debt, Shift } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { NavSection } from '../../components/layout/Sidebar.js';
import { api } from '../../api/client.js';

interface DashboardViewProps {
  overview: DashboardOverview | null;
  onNavigate: (section: NavSection, extraFilter?: string) => void;
  onOpenAddStudent: () => void;
  onOpenQuickPayment: () => void;
  onViewReceipt: (paymentId: string) => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  overview,
  onNavigate,
  onOpenAddStudent,
  onOpenQuickPayment,
  onViewReceipt,
  onRefresh,
}) => {
  const { t } = useLanguage();
  const { canReceivePayments, canManageFinance } = useAuth();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<string | null>(null);

  if (!overview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-zinc-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  const stats = overview.stats || {
    totalStudents: 0,
    activeMemberships: 0,
    expiringSoon: 0,
    expiredCount: 0,
    debtorsCount: 0,
    totalDebtAmount: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    activeTodayStudentsCount: 0,
  };
  const alerts = overview.alerts || [];
  const todayShifts = overview.todayShifts || [];
  const recentPayments = overview.recentPayments || [];
  const topDebtors = overview.topDebtors || [];

  const handleRunDailyCheck = async () => {
    setIsEvaluating(true);
    try {
      const res = await api.evaluateMemberships();
      setEvalResult(
        `Санҷиш бомуваффақият гузашт: ${res.stats.evaluatedCount} абонемент санҷида шуд, ${res.stats.newDebtors} қарздор муайян гардид.`
      );
      onRefresh();
      setTimeout(() => setEvalResult(null), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-7 pb-12">
      {/* Top Welcome & Notification Feedback */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase font-sans">
            {t.welcomeTitle}
          </h1>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
            Платформаи автоматикунонии ресепшн ва идоракунии толори TM BAYONOV MMA
          </p>
        </div>

        <button
          onClick={handleRunDailyCheck}
          disabled={isEvaluating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-bold rounded-xl border border-zinc-700 shadow-sm transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{isEvaluating ? t.loading : t.btnRunDailyCheck}</span>
        </button>
      </div>

      {evalResult && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{evalResult}</span>
        </div>
      )}

      {/* QUICK ACTIONS ROW (Section 46) - Luminous Bright Green (Сабзи равшантар ва нурдор) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-slate-950 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-emerald-500/30 border-2 border-emerald-300/80 transition-all">
        {/* Radiant Luminous Glowing Lights */}
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-white/40 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute left-1/3 -bottom-14 w-72 h-40 bg-emerald-200/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-44 h-44 bg-teal-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between mb-3.5">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-950 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-white/80">
            {t.quickActions}
          </span>
          <span className="text-xs text-emerald-950 font-black flex items-center gap-1.5 drop-shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-950 animate-ping inline-block" />
            Дастрасии зуд бо 1 клик
          </span>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={onOpenAddStudent}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-emerald-950 hover:bg-black text-white rounded-xl font-black text-xs tracking-wide transition-all shadow-md shadow-emerald-950/30 hover:scale-[1.02] border border-emerald-700/50"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>{t.btnAddStudent}</span>
          </button>

          {canReceivePayments && (
            <button
              onClick={onOpenQuickPayment}
              className="flex items-center justify-center gap-2 px-3 py-3 bg-white hover:bg-emerald-50 text-emerald-950 rounded-xl font-black text-xs tracking-wide transition-all shadow-lg shadow-emerald-900/20 hover:scale-[1.02] border border-white"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>{t.btnReceivePayment}</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('students')}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-emerald-900/90 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm hover:scale-[1.02] border border-emerald-700/40 backdrop-blur-md"
          >
            <Users className="w-4 h-4 text-emerald-300" />
            <span>{t.btnStudentsList}</span>
          </button>

          <button
            onClick={() => onNavigate('debtors')}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-xs tracking-wide transition-all shadow-md hover:scale-[1.02] border border-amber-200"
          >
            <AlertOctagon className="w-4 h-4 text-amber-950" />
            <span>{t.btnDebtorsList} ({stats.debtorsCount})</span>
          </button>

          <button
            onClick={() => onNavigate('attendance')}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-emerald-900/90 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm hover:scale-[1.02] border border-emerald-700/40 backdrop-blur-md"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-300" />
            <span>{t.btnAttendance}</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-teal-900 hover:bg-teal-950 text-white rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm hover:scale-[1.02] border border-teal-700/40 backdrop-blur-md"
          >
            <BarChart3 className="w-4 h-4 text-teal-300" />
            <span>{t.btnReports}</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS (Section 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="cursor-pointer p-5 bg-[#0b2c1f] rounded-2xl border border-emerald-800/40 shadow-md hover:border-emerald-500/60 transition-all group"
        >
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
              {t.totalStudents}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-2">
            {stats.totalStudents}
          </p>
          <span className="text-[11px] text-emerald-300/60 font-medium">Ҳамаи бақайдгириҳо</span>
        </div>

        {/* Active Memberships */}
        <div
          onClick={() => onNavigate('students', 'ACTIVE')}
          className="cursor-pointer p-5 bg-[#0b2c1f] rounded-2xl border border-emerald-500/40 shadow-md hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t.activeMemberships}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2">
            {stats.activeMemberships}
          </p>
          <span className="text-[11px] text-emerald-400/80 font-medium">Иҷозати машқ доранд</span>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => onNavigate('students', 'EXPIRING_SOON')}
          className="cursor-pointer p-5 bg-[#0b2c1f] rounded-2xl border border-amber-500/40 shadow-md hover:border-amber-400 transition-all group"
        >
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t.expiringSoon}
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-400 mt-2">
            {stats.expiringSoon}
          </p>
          <span className="text-[11px] text-amber-400/80 font-medium">Дар 3 рӯзи наздик</span>
        </div>

        {/* Debtors */}
        <div
          onClick={() => onNavigate('debtors')}
          className="cursor-pointer p-5 bg-[#0b2c1f] rounded-2xl border border-rose-500/40 shadow-md hover:border-rose-400 transition-all group"
        >
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t.debtors}
            </span>
            <div className="p-2 rounded-xl bg-rose-500/20 group-hover:scale-110 transition-transform">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          <p className="text-3xl font-black text-rose-400 mt-2">
            {stats.debtorsCount}
          </p>
          <span className="text-[11px] text-rose-300 font-medium">
            {stats.totalDebtAmount.toLocaleString()} {t.currency} қарз
          </span>
        </div>
      </div>

      {/* REVENUE ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Today's Revenue */}
        <div className="p-5 bg-[#0b2c1f] rounded-2xl border border-emerald-800/40 shadow-md">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
            {t.todayRevenue}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white">
              {stats.todayRevenue.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-emerald-400">{t.currency}</span>
          </div>
          <p className="text-[11px] text-emerald-300/60 mt-1">Пардохтҳои имрӯзаи қабулгоҳ</p>
        </div>

        {/* Monthly Revenue */}
        <div className="p-5 bg-[#0b2c1f] rounded-2xl border border-emerald-800/40 shadow-md">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
            {t.monthlyRevenue}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-white">
              {stats.monthlyRevenue.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-emerald-400">{t.currency}</span>
          </div>
          <p className="text-[11px] text-emerald-300/60 mt-1">Маблағи умумии моҳи ҷорӣ</p>
        </div>

        {/* Today's Active Training Headcount */}
        <div className="p-5 bg-[#0b2c1f] rounded-2xl border border-emerald-800/40 shadow-md sm:col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80">
            {t.todayTraining}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-400">
              {stats.activeTodayStudentsCount}
            </span>
            <span className="text-sm font-bold text-emerald-200">шогирд</span>
          </div>
          <p className="text-[11px] text-emerald-300/60 mt-1">Дар сменаҳои имрӯза тамрин мекунанд</p>
        </div>
      </div>

      {/* DASHBOARD ALERTS (Section 7) */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
          {t.alertsTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alerts.map((alert) => {
            const isDanger = alert.type === 'DANGER' || alert.type === 'DEBT';
            const isWarning = alert.type === 'WARNING';
            return (
              <button
                key={alert.id}
                onClick={() => {
                  if (alert.action === 'NAV_DEBTORS') onNavigate('debtors');
                  else if (alert.action === 'NAV_STUDENTS_EXPIRING')
                    onNavigate('students', 'EXPIRING_SOON');
                  else if (alert.action === 'NAV_ATTENDANCE') onNavigate('attendance');
                }}
                className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all group ${
                  isDanger
                    ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 text-rose-800 dark:text-rose-300'
                    : isWarning
                    ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                    : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-800 dark:text-blue-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {isDanger ? '🔴' : isWarning ? '🟡' : '👊'}
                  </span>
                  <span className="text-xs font-bold">{alert.labelTj}</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>
      </div>

      {/* TODAY'S TRAINING SHIFTS (Section 23) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-white">
            Гурӯҳҳо ва Сменаҳои имрӯз
          </h3>
          <button
            onClick={() => onNavigate('attendance')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Қайди давомот <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayShifts.map((shift) => (
            <div
              key={shift.id}
              onClick={() => onNavigate('attendance', shift.id)}
              className="cursor-pointer p-5 bg-[#0b2c1f] rounded-2xl border border-emerald-800/40 hover:border-emerald-500/60 shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30">
                  {shift.name}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-300/80">
                  {shift.startTime} – {shift.endTime}
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div>
                  <p className="text-xs text-emerald-300/60 font-medium">Шогирдони фаъол:</p>
                  <p className="text-2xl font-black text-white mt-0.5">
                    {shift.studentCount} шогирд
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-300/60 font-medium">Сармураббӣ:</p>
                  <p className="text-xs font-bold text-emerald-200">
                    {shift.coachName}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-800/50 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>{shift.daysTextTj}</span>
                <span className="group-hover:underline">Кушодани давомот →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TWO COLUMN SUMMARY: TOP DEBTORS & RECENT PAYMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Debtors Section */}
        <div className="p-5 bg-[#0b2c1f] rounded-2xl border border-emerald-800/40 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h4 className="text-sm font-extrabold uppercase tracking-wide text-white">
                Қарздорони асосӣ (🔴)
              </h4>
            </div>
            <button
              onClick={() => onNavigate('debtors')}
              className="text-xs font-bold text-rose-400 hover:text-rose-300"
            >
              Ҳамаи қарздорон ({stats.debtorsCount}) →
            </button>
          </div>

          {topDebtors.length === 0 ? (
            <p className="text-xs text-emerald-300/60 text-center py-6">
              Ҳоло ҳеҷ қарздоре вуҷуд надорад. Ҳамаи пардохтҳо саривақтӣ мебошанд!
            </p>
          ) : (
            <div className="divide-y divide-emerald-800/40">
              {topDebtors.map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-extrabold text-white">{d.studentName}</p>
                    <p className="text-[11px] text-emerald-300/70 font-mono">{d.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-400 text-sm">
                      {d.amount} {t.currency}
                    </span>
                    <p className="text-[10px] text-rose-400/80 font-bold">
                      {d.daysOverdue} рӯз гузаштааст
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payments Section */}
        <div className="p-5 bg-[#0b2c1f] rounded-2xl border border-emerald-800/40 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-extrabold uppercase tracking-wide text-white">
                Охирин пардохтҳо
              </h4>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              Таърихи пурра →
            </button>
          </div>

          {recentPayments.length === 0 ? (
            <p className="text-xs text-emerald-300/60 text-center py-6">
              Имрӯз то ҳол пардохте сабт нашудааст
            </p>
          ) : (
            <div className="divide-y divide-emerald-800/40">
              {recentPayments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-extrabold text-white">{p.studentName}</p>
                    <p className="text-[11px] text-emerald-300/70 font-mono">
                      {p.receiptNumber} • {p.paymentDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-black text-emerald-400 text-sm">
                        +{p.amount} {t.currency}
                      </span>
                      <p className="text-[10px] text-emerald-300/70 uppercase">{p.paymentMethod}</p>
                    </div>
                    <button
                      onClick={() => onViewReceipt(p.id)}
                      title="Чопи расид"
                      className="p-1.5 rounded-lg bg-emerald-900/60 text-emerald-300 hover:text-white hover:bg-emerald-800"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
