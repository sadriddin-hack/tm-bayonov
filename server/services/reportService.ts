import { db, getDushanbeCurrentDate, formatDateTj } from '../db.js';
import { MembershipService } from './membershipService.js';

export class ReportService {
  static getDashboardOverview() {
    // Run evaluation so data is live
    MembershipService.evaluateMembershipsAndDebts(false);

    const data = db.get();
    const today = getDushanbeCurrentDate();
    const [currentYear, currentMonth] = today.split('-');
    const currentMonthPrefix = `${currentYear}-${currentMonth}`;

    const activeStudents = data.students.filter((s) => !s.isDeleted);
    const totalStudents = activeStudents.length;

    const activeMemberships = data.memberships.filter((m) => m.status === 'ACTIVE').length;
    const expiringSoon = data.memberships.filter((m) => m.status === 'EXPIRING_SOON').length;
    const expired = data.memberships.filter((m) => m.status === 'EXPIRED').length;
    const debtorsCount = data.debts.length;

    const totalDebtAmount = data.debts.reduce((sum, d) => sum + d.amount, 0);

    const todayRevenue = data.payments
      .filter((p) => p.paymentDate === today)
      .reduce((sum, p) => sum + p.amount, 0);

    const monthlyRevenue = data.payments
      .filter((p) => p.paymentDate.startsWith(currentMonthPrefix))
      .reduce((sum, p) => sum + p.amount, 0);

    // Today's day of week (0=Sun, 1=Mon, ..., 6=Sat)
    const todayDayOfWeek = new Date(today + 'T00:00:00Z').getUTCDay();
    const todayShifts = data.shifts.map((shift) => {
      const isToday = shift.daysOfWeek.includes(todayDayOfWeek);
      const studentCount = activeStudents.filter((s) => s.shiftId === shift.id).length;
      return {
        ...shift,
        isToday,
        studentCount,
      };
    });

    const activeTodayStudentsCount = todayShifts
      .filter((s) => s.isToday)
      .reduce((sum, s) => sum + s.studentCount, 0);

    // Alerts
    const alerts = [
      {
        id: 'alert-expired',
        type: 'DANGER',
        count: expired,
        labelTj: `${expired} шогирд абонементи баохиррасида доранд`,
        labelRu: `${expired} учеников с истекшим абонементом`,
        action: 'NAV_DEBTORS',
      },
      {
        id: 'alert-expiring-3days',
        type: 'WARNING',
        count: expiringSoon,
        labelTj: `${expiringSoon} шогирд муҳлаташон дар 3 рӯзи наздик ба итмом мерасад`,
        labelRu: `${expiringSoon} абонементов истекают в течение 3 дней`,
        action: 'NAV_STUDENTS_EXPIRING',
      },
      {
        id: 'alert-debt',
        type: 'DEBT',
        count: totalDebtAmount,
        labelTj: `${totalDebtAmount.toLocaleString()} сомонӣ қарзи умумии пардохтнашуда`,
        labelRu: `${totalDebtAmount.toLocaleString()} сомони общая сумма задолженности`,
        action: 'NAV_DEBTORS',
      },
      {
        id: 'alert-training-today',
        type: 'INFO',
        count: activeTodayStudentsCount,
        labelTj: `${activeTodayStudentsCount} шогирд имрӯз машқ доранд`,
        labelRu: `${activeTodayStudentsCount} учеников тренируются сегодня`,
        action: 'NAV_ATTENDANCE',
      },
    ];

    // Recent 5 payments
    const recentPayments = data.payments.slice(0, 5);

    // Recent 5 debtors
    const topDebtors = data.debts.slice(0, 5);

    return {
      stats: {
        totalStudents,
        activeMemberships,
        expiringSoon,
        expired,
        debtorsCount,
        todayRevenue,
        monthlyRevenue,
        totalDebtAmount,
        activeTodayStudentsCount,
      },
      alerts,
      todayShifts,
      recentPayments,
      topDebtors,
      currentDate: today,
    };
  }

  static getFinanceReport() {
    const data = db.get();
    const today = getDushanbeCurrentDate();

    // Payment methods aggregation
    const methodCounts: Record<string, number> = {
      CASH: 0,
      CARD: 0,
      BANK_TRANSFER: 0,
      OTHER: 0,
    };
    const methodAmounts: Record<string, number> = {
      CASH: 0,
      CARD: 0,
      BANK_TRANSFER: 0,
      OTHER: 0,
    };

    data.payments.forEach((p) => {
      methodCounts[p.paymentMethod] = (methodCounts[p.paymentMethod] || 0) + 1;
      methodAmounts[p.paymentMethod] = (methodAmounts[p.paymentMethod] || 0) + p.amount;
    });

    // Last 7 days revenue
    const dailyRevenueMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today + 'T00:00:00Z');
      d.setDate(d.getDate() - i);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const key = `${y}-${m}-${day}`;
      dailyRevenueMap[key] = 0;
    }

    data.payments.forEach((p) => {
      if (dailyRevenueMap[p.paymentDate] !== undefined) {
        dailyRevenueMap[p.paymentDate] += p.amount;
      }
    });

    const dailyRevenueChart = Object.entries(dailyRevenueMap).map(([date, amount]) => ({
      date: formatDateTj(date),
      rawDate: date,
      amount,
    }));

    // Status distribution
    const statusDistribution = [
      { name: 'Фаъол (Active)', count: data.memberships.filter((m) => m.status === 'ACTIVE').length, color: '#16a34a' },
      { name: 'Муҳлаташ наздик (Expiring)', count: data.memberships.filter((m) => m.status === 'EXPIRING_SOON').length, color: '#eab308' },
      { name: 'Қарздор (Debtor)', count: data.debts.length, color: '#dc2626' },
      { name: 'Мӯҳлат гузашта (Expired)', count: data.memberships.filter((m) => m.status === 'EXPIRED').length, color: '#9333ea' },
    ];

    const totalIncome = data.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalDebt = data.debts.reduce((sum, d) => sum + d.amount, 0);

    return {
      totalIncome,
      totalDebt,
      totalPaymentsCount: data.payments.length,
      methodBreakdown: [
        { method: 'CASH', labelTj: 'Нақд', labelRu: 'Наличные', amount: methodAmounts.CASH, count: methodCounts.CASH },
        { method: 'CARD', labelTj: 'Корти бонкӣ', labelRu: 'Банковская карта', amount: methodAmounts.CARD, count: methodCounts.CARD },
        { method: 'BANK_TRANSFER', labelTj: 'Интиқоли бонкӣ (Алиф/DC)', labelRu: 'Банковский перевод (Алиф/DC)', amount: methodAmounts.BANK_TRANSFER, count: methodCounts.BANK_TRANSFER },
      ],
      dailyRevenueChart,
      statusDistribution,
      payments: data.payments,
    };
  }
}
