import { db, getDushanbeCurrentDate, formatDateTj } from '../db.js';
import { Membership, Debt, MembershipStatus, PaymentMethod } from '../types.js';
import { NotificationService } from './notificationService.js';

export class MembershipService {
  // Compute difference in days between two YYYY-MM-DD dates
  static diffDays(targetDateStr: string, fromDateStr: string): number {
    const target = new Date(targetDateStr + 'T00:00:00Z');
    const from = new Date(fromDateStr + 'T00:00:00Z');
    const diffTime = target.getTime() - from.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  // Add months to a YYYY-MM-DD date string
  static addMonths(dateStr: string, months: number): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setMonth(date.getMonth() + months);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Add days to a YYYY-MM-DD date string
  static addDays(dateStr: string, days: number): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // CORE SCHEDULED / ON-DEMAND EXPIRATION & DEBT EVALUATOR
  static evaluateMembershipsAndDebts(forceCheck = false): {
    evaluatedCount: number;
    newlyExpired: number;
    newDebtors: number;
    remindersSent: number;
  } {
    const today = getDushanbeCurrentDate();

    return db.mutate((data) => {
      let newlyExpired = 0;
      let newDebtors = 0;
      let remindersSent = 0;
      const settings = data.settings;

      for (const membership of data.memberships) {
        if (membership.status === 'SUSPENDED' || membership.status === 'CANCELLED') {
          continue;
        }

        const student = data.students.find((s) => s.id === membership.studentId && !s.isDeleted);
        if (!student) continue;

        const remaining = MembershipService.diffDays(membership.endDate, today);
        membership.daysRemaining = remaining;

        const previousStatus = membership.status;

        if (remaining > 3) {
          membership.status = 'ACTIVE';
        } else if (remaining >= 0 && remaining <= 3) {
          membership.status = 'EXPIRING_SOON';

          // Check if reminder should be sent (e.g. 3 days, 1 day, or 0 days / today)
          const alreadyNotifiedToday = data.notifications.some(
            (n) =>
              n.studentId === student.id &&
              (n.type === 'EXPIRING_SOON' || n.type === 'EXPIRING_TOMORROW') &&
              n.sentAt.startsWith(today)
          );

          if (!alreadyNotifiedToday) {
            const tmpl = data.templates.find((t) =>
              remaining === 1 ? t.type === 'EXPIRING_TOMORROW' : t.type === 'EXPIRING_SOON'
            );
            if (tmpl && tmpl.enabled) {
              const msg = NotificationService.renderTemplate(tmpl.templateTj, {
                student_name: student.fullName,
                expiration_date: formatDateTj(membership.endDate),
                amount: membership.price,
                shift: data.shifts.find((sh) => sh.id === student.shiftId)?.name || 'Смена',
                gym_name: settings.gymName,
              });

              for (const ch of tmpl.channels) {
                NotificationService.sendNotification({
                  studentId: student.id,
                  studentName: student.fullName,
                  phone: student.phone,
                  channel: ch,
                  type: remaining === 1 ? 'EXPIRING_TOMORROW' : 'EXPIRING_SOON',
                  message: msg,
                });
                remindersSent++;
              }
            }
          }
        } else {
          // remaining < 0 -> EXPIRED
          if (previousStatus !== 'DEBTOR' && previousStatus !== 'EXPIRED') {
            newlyExpired++;
          }

          // Rule: If expired and payment missing -> DEBTOR
          membership.status = 'DEBTOR';

          // Check if debt record exists
          let debt = data.debts.find((d) => d.studentId === student.id);
          const daysOverdue = Math.abs(remaining);

          if (!debt) {
            newDebtors++;
            const newDebt: Debt = {
              id: 'dbt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              studentId: student.id,
              studentName: student.fullName,
              phone: student.phone,
              shiftId: student.shiftId,
              amount: student.monthlyPrice || membership.price,
              overdueDate: membership.endDate,
              daysOverdue,
              notes: `Абонемент ба анҷом расид (${formatDateTj(membership.endDate)})`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            data.debts.push(newDebt);

            // Send debt alert
            const debtTmpl = data.templates.find((t) => t.type === 'DEBT_REMINDER');
            if (debtTmpl && debtTmpl.enabled) {
              const msg = NotificationService.renderTemplate(debtTmpl.templateTj, {
                student_name: student.fullName,
                amount: newDebt.amount,
                gym_name: settings.gymName,
              });
              NotificationService.sendNotification({
                studentId: student.id,
                studentName: student.fullName,
                phone: student.phone,
                channel: 'SMS',
                type: 'DEBT_REMINDER',
                message: msg,
              });
              remindersSent++;
            }
          } else {
            // Update overdue days
            debt.daysOverdue = daysOverdue;
            debt.updatedAt = new Date().toISOString();

            // Configurable debt mode check
            if (settings.debtMode === 'FIXED_MONTHLY') {
              const overdueMonths = Math.floor(daysOverdue / 30);
              const expectedTotalDebt = (student.monthlyPrice || membership.price) * Math.max(1, overdueMonths);
              if (expectedTotalDebt > debt.amount) {
                debt.amount = expectedTotalDebt;
                debt.notes = `${overdueMonths} моҳ қарздории ҷамъшуда`;
              }
            }
          }
        }

        membership.updatedAt = new Date().toISOString();
      }

      data.lastDailyCheck = today;

      return {
        evaluatedCount: data.memberships.length,
        newlyExpired,
        newDebtors,
        remindersSent,
      };
    });
  }

  // RENEW MEMBERSHIP WITH PAYMENT
  static renewMembership(params: {
    studentId: string;
    durationMonths: number;
    amount: number;
    paymentMethod: PaymentMethod;
    receivedBy: string;
    receivedById: string;
    notes?: string;
    startDateOverride?: string;
  }): { membership: Membership; paymentId: string; receiptNumber: string } {
    const today = getDushanbeCurrentDate();

    return db.mutate((data) => {
      const student = data.students.find((s) => s.id === params.studentId && !s.isDeleted);
      if (!student) {
        throw new Error('Шогирд ёфт нашуд');
      }

      let membership = data.memberships.find((m) => m.studentId === params.studentId);
      if (!membership) {
        membership = {
          id: 'mb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          studentId: student.id,
          shiftId: student.shiftId,
          startDate: today,
          endDate: MembershipService.addMonths(today, params.durationMonths || 1),
          durationMonths: params.durationMonths || 1,
          price: params.amount,
          status: 'ACTIVE',
          daysRemaining: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        data.memberships.push(membership);
      }

      // Calculate new start and expiration dates according to user specification:
      // "IF current membership is still active: Extend from current expiration date!
      //  IF membership is already expired: Start new membership from current date."
      let newStartDate = today;
      let newEndDate = today;

      const policy = data.settings.autoExtendPolicy;
      const isCurrentlyActive =
        (membership.status === 'ACTIVE' || membership.status === 'EXPIRING_SOON') &&
        MembershipService.diffDays(membership.endDate, today) >= 0;

      if (params.startDateOverride) {
        newStartDate = params.startDateOverride;
        newEndDate = MembershipService.addMonths(newStartDate, params.durationMonths);
      } else if (isCurrentlyActive && policy === 'PRESERVE_REMAINING') {
        // PRESERVE REMAINING DAYS: Extend from previous end date
        newStartDate = membership.startDate;
        newEndDate = MembershipService.addMonths(membership.endDate, params.durationMonths);
      } else {
        // EXPIRED OR START FRESH TODAY
        newStartDate = today;
        newEndDate = MembershipService.addMonths(today, params.durationMonths);
      }

      membership.startDate = newStartDate;
      membership.endDate = newEndDate;
      membership.durationMonths = params.durationMonths;
      membership.price = params.amount;
      membership.status = 'ACTIVE';
      membership.daysRemaining = MembershipService.diffDays(newEndDate, today);
      membership.lastPaymentDate = today;
      membership.updatedAt = new Date().toISOString();

      // Create Payment & Receipt
      const receiptSeq = (data.payments.length + 1).toString().padStart(4, '0');
      const yearMonth = today.replace('-', '').substring(0, 6);
      const receiptNumber = `REC-${yearMonth}-${receiptSeq}`;

      const payment = {
        id: 'pay-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        receiptNumber,
        studentId: student.id,
        studentName: student.fullName,
        amount: params.amount,
        paymentDate: today,
        paymentMethod: params.paymentMethod,
        membershipPeriod: `${formatDateTj(newStartDate)} - ${formatDateTj(newEndDate)}`,
        receivedBy: params.receivedBy,
        receivedById: params.receivedById,
        notes: params.notes || 'Пардохт ва тамдиди абонемент',
        createdAt: new Date().toISOString(),
      };
      data.payments.unshift(payment);

      // Reduce or remove debt if exists
      const debtIdx = data.debts.findIndex((d) => d.studentId === student.id);
      if (debtIdx !== -1) {
        const debt = data.debts[debtIdx];
        if (params.amount >= debt.amount) {
          // Cleared completely
          data.debts.splice(debtIdx, 1);
        } else {
          debt.amount -= params.amount;
          debt.updatedAt = new Date().toISOString();
        }
      }

      // Add audit log
      data.auditLogs.unshift({
        id: 'aud-' + Date.now(),
        userId: params.receivedById,
        userName: params.receivedBy,
        userRole: 'RECEPTION',
        action: 'MEMBERSHIP_RENEWAL_PAYMENT',
        entity: 'Membership',
        entityId: membership.id,
        details: `Тамдиди абонементи ${student.fullName} бо маблағи ${params.amount} сомонӣ то ${formatDateTj(newEndDate)} (${receiptNumber})`,
        timestamp: new Date().toISOString(),
      });

      // Send confirmation notification
      const payTmpl = data.templates.find((t) => t.type === 'PAYMENT_RECEIVED');
      if (payTmpl && payTmpl.enabled) {
        const msg = NotificationService.renderTemplate(payTmpl.templateTj, {
          student_name: student.fullName,
          amount: params.amount,
          expiration_date: formatDateTj(newEndDate),
          gym_name: data.settings.gymName,
        });

        NotificationService.sendNotification({
          studentId: student.id,
          studentName: student.fullName,
          phone: student.phone,
          channel: student.telegramChatId ? 'TELEGRAM' : 'SMS',
          type: 'PAYMENT_RECEIVED',
          message: msg,
        });
      }

      return {
        membership,
        paymentId: payment.id,
        receiptNumber,
      };
    });
  }
}
