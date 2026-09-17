import { db, getDushanbeCurrentDate } from '../db.js';
import { NotificationLog, NotificationTemplate } from '../types.js';

export class NotificationService {
  static renderTemplate(templateStr: string, variables: Record<string, string | number>): string {
    let result = templateStr;
    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{${key}\\}`, 'g');
      result = result.replace(pattern, String(value));
    }
    return result;
  }

  static sendNotification(params: {
    studentId?: string;
    studentName?: string;
    phone?: string;
    channel: 'SMS' | 'TELEGRAM' | 'IN_APP';
    type: NotificationLog['type'];
    message: string;
  }): NotificationLog {
    const settings = db.get().settings;
    let status: 'SENT' | 'FAILED' | 'CONFIG_MISSING' = 'SENT';
    let errorDetails: string | undefined;

    if (params.channel === 'SMS') {
      if (!settings.smsConfigured || !settings.smsApiKey) {
        status = 'CONFIG_MISSING';
        errorDetails = 'Хизматрасонии SMS танзим нашудааст (SMS provider not configured)';
      }
    } else if (params.channel === 'TELEGRAM') {
      if (!settings.telegramConfigured || !settings.telegramBotToken) {
        status = 'CONFIG_MISSING';
        errorDetails = 'Боти Telegram танзим нашудааст (Telegram bot not configured)';
      }
    }

    const log: NotificationLog = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId: params.studentId,
      studentName: params.studentName,
      phone: params.phone,
      channel: params.channel,
      type: params.type,
      message: params.message,
      status,
      errorDetails,
      sentAt: new Date().toISOString(),
    };

    db.mutate((data) => {
      data.notifications.unshift(log);
      // Keep recent 500 logs
      if (data.notifications.length > 500) {
        data.notifications = data.notifications.slice(0, 500);
      }
    });

    return log;
  }

  static getTemplates(): NotificationTemplate[] {
    return db.get().templates;
  }

  static updateTemplate(id: string, updates: Partial<NotificationTemplate>): NotificationTemplate {
    return db.mutate((data) => {
      const tmpl = data.templates.find((t) => t.id === id);
      if (!tmpl) throw new Error('Шаблон ёфт нашуд');
      Object.assign(tmpl, updates);
      return tmpl;
    });
  }

  static getRecentLogs(limit = 100): NotificationLog[] {
    return db.get().notifications.slice(0, limit);
  }

  static getDailySummary(): string {
    const data = db.get();
    const today = getDushanbeCurrentDate();
    const totalStudents = data.students.filter((s) => !s.isDeleted).length;
    const active = data.memberships.filter((m) => m.status === 'ACTIVE').length;
    const expiring = data.memberships.filter((m) => m.status === 'EXPIRING_SOON').length;
    const debtors = data.debts.length;

    const todayIncome = data.payments
      .filter((p) => p.paymentDate === today)
      .reduce((sum, p) => sum + p.amount, 0);

    return `TM BAYONOV MMA\nҲисоботи имрӯз (${today}):\n\n👥 Шогирдон: ${totalStudents}\n🟢 Фаъол: ${active}\n🟡 Муҳлаташ наздик: ${expiring}\n🔴 Қарздор: ${debtors}\n\n💰 Даромад: ${todayIncome} TJS (сомонӣ)`;
  }
}
