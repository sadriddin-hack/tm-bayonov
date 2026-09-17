import express, { Request, Response, NextFunction } from 'express';
import { db, getDushanbeCurrentDate, formatDateTj } from '../db.js';
import { AuthService, AuthTokenPayload } from '../services/authService.js';
import { StudentService } from '../services/studentService.js';
import { MembershipService } from '../services/membershipService.js';
import { AttendanceService } from '../services/attendanceService.js';
import { NotificationService } from '../services/notificationService.js';
import { ReportService } from '../services/reportService.js';

export const apiRouter = express.Router();

// Middleware to extract authenticated user
export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Логин талаб карда мешавад (Требуется авторизация)' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const user = AuthService.verifyToken(token);
    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: err.message || 'Сессия беэътибор аст' });
  }
};

// Optional auth middleware (for easier initial preview while supporting true authentication)
const optionalAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = AuthService.verifyToken(authHeader.split(' ')[1]);
    } catch {
      // ignore
    }
  }
  // Default to Super Admin / Reception fallback if no header provided during preview
  if (!req.user) {
    req.user = {
      userId: 'usr-superadmin-01',
      email: 'admin@tmbayonov.tj',
      name: 'Устод Баёнов',
      role: 'SUPER_ADMIN',
    };
  }
  next();
};

// ==========================================
// 1. AUTHENTICATION
// ==========================================
apiRouter.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Почта ва рамзро ворид намоед' });
    }
    const result = AuthService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/auth/me', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

apiRouter.post('/auth/change-password', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    AuthService.changePassword(req.user!.userId, oldPassword, newPassword);
    res.json({ success: true, message: 'Рамз бомуваффақият иваз карда шуд' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 2. DASHBOARD
// ==========================================
apiRouter.get('/dashboard/overview', optionalAuthMiddleware, (req, res) => {
  try {
    const overview = ReportService.getDashboardOverview();
    res.json(overview);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. STUDENTS
// ==========================================
apiRouter.get('/students', optionalAuthMiddleware, (req, res) => {
  try {
    const { search, shiftId, status, page, limit } = req.query;
    const result = StudentService.getStudents({
      search: search as string,
      shiftId: shiftId as string,
      status: status as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 50,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/students/:id', optionalAuthMiddleware, (req, res) => {
  try {
    const student = StudentService.getStudentById(req.params.id);
    res.json(student);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

apiRouter.post('/students', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const newStudent = StudentService.createStudent({
      ...req.body,
      createdByUserId: req.user?.userId || 'usr-reception-01',
      createdByUserName: req.user?.name || 'Ресепшн',
    });
    res.status(201).json(newStudent);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/students/:id', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const updated = StudentService.updateStudent(
      req.params.id,
      req.body,
      req.user?.userId || 'usr-admin',
      req.user?.name || 'Админ'
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/students/:id', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const result = StudentService.deleteStudent(
      req.params.id,
      req.user?.userId || 'usr-admin',
      req.user?.name || 'Админ'
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 4. MEMBERSHIPS & RENEWAL
// ==========================================
apiRouter.post('/memberships/renew', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { studentId, durationMonths, amount, paymentMethod, notes, startDateOverride } = req.body;
    if (!studentId || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'Маълумоти пурра ворид намоед' });
    }

    const result = MembershipService.renewMembership({
      studentId,
      durationMonths: durationMonths || 1,
      amount: Number(amount),
      paymentMethod,
      receivedBy: req.user?.name || 'Ресепшн',
      receivedById: req.user?.userId || 'usr-reception-01',
      notes,
      startDateOverride,
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Trigger daily background job evaluation on demand
apiRouter.post('/memberships/evaluate', optionalAuthMiddleware, (req, res) => {
  try {
    const stats = MembershipService.evaluateMembershipsAndDebts(true);
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. DEBTS
// ==========================================
apiRouter.get('/debts', optionalAuthMiddleware, (req, res) => {
  try {
    // Refresh debts
    MembershipService.evaluateMembershipsAndDebts(false);
    const data = db.get();
    const { search } = req.query;

    let debts = data.debts;
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      debts = debts.filter(
        (d) => d.studentName.toLowerCase().includes(q) || d.phone.includes(q)
      );
    }

    // Add shift details
    const enriched = debts.map((d) => {
      const shift = data.shifts.find((s) => s.id === d.shiftId);
      return {
        ...d,
        shiftName: shift?.name || 'Смена',
      };
    });

    res.json({
      items: enriched,
      totalCount: enriched.length,
      totalAmount: enriched.reduce((sum, d) => sum + d.amount, 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Pay debt
apiRouter.post('/debts/:id/pay', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { amount, paymentMethod, notes } = req.body;
    const debtId = req.params.id;

    const result = db.mutate((data) => {
      const debtIdx = data.debts.findIndex((d) => d.id === debtId);
      if (debtIdx === -1) throw new Error('Қарз ёфт нашуд');

      const debt = data.debts[debtIdx];
      const payAmount = Number(amount) || debt.amount;
      const today = getDushanbeCurrentDate();

      // Create payment
      const receiptSeq = (data.payments.length + 1).toString().padStart(4, '0');
      const yearMonth = today.replace('-', '').substring(0, 6);
      const receiptNumber = `REC-${yearMonth}-${receiptSeq}`;

      const payment = {
        id: 'pay-' + Date.now(),
        receiptNumber,
        studentId: debt.studentId,
        studentName: debt.studentName,
        amount: payAmount,
        paymentDate: today,
        paymentMethod: paymentMethod || 'CASH',
        membershipPeriod: `Пардохти қарз (${formatDateTj(debt.overdueDate)})`,
        receivedBy: req.user?.name || 'Ресепшн',
        receivedById: req.user?.userId || 'usr-reception-01',
        notes: notes || 'Пардохти пурра ё қисман қарз',
        createdAt: new Date().toISOString(),
      };
      data.payments.unshift(payment);

      if (payAmount >= debt.amount) {
        data.debts.splice(debtIdx, 1);
        // Also if membership was marked DEBTOR, activate or check
        const mb = data.memberships.find((m) => m.studentId === debt.studentId);
        if (mb) {
          mb.status = 'ACTIVE';
          mb.startDate = today;
          mb.endDate = MembershipService.addMonths(today, 1);
          mb.daysRemaining = MembershipService.diffDays(mb.endDate, today);
          mb.updatedAt = new Date().toISOString();
        }
      } else {
        debt.amount -= payAmount;
        debt.updatedAt = new Date().toISOString();
      }

      data.auditLogs.unshift({
        id: 'aud-' + Date.now(),
        userId: req.user?.userId || 'usr-reception-01',
        userName: req.user?.name || 'Ресепшн',
        userRole: 'RECEPTION',
        action: 'DEBT_PAYMENT',
        entity: 'Debt',
        entityId: debtId,
        details: `Пардохти қарзи ${debt.studentName} ба маблағи ${payAmount} сомонӣ (${receiptNumber})`,
        timestamp: new Date().toISOString(),
      });

      return { success: true, payment, remainingDebt: debtIdx !== -1 && data.debts[debtIdx] ? data.debts[debtIdx].amount : 0 };
    });

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 6. PAYMENTS & RECEIPTS
// ==========================================
apiRouter.get('/payments', optionalAuthMiddleware, (req, res) => {
  try {
    const data = db.get();
    const { studentId, search, dateFrom, dateTo } = req.query;
    let list = data.payments;

    if (studentId) {
      list = list.filter((p) => p.studentId === studentId);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.studentName.toLowerCase().includes(q) ||
          p.receiptNumber.toLowerCase().includes(q)
      );
    }
    if (dateFrom && typeof dateFrom === 'string') {
      list = list.filter((p) => p.paymentDate >= dateFrom);
    }
    if (dateTo && typeof dateTo === 'string') {
      list = list.filter((p) => p.paymentDate <= dateTo);
    }

    res.json({
      items: list,
      totalCount: list.length,
      totalAmount: list.reduce((sum, p) => sum + p.amount, 0),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/payments', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { studentId, amount, paymentMethod, membershipPeriod, notes } = req.body;
    const data = db.get();
    const student = data.students.find((s) => s.id === studentId && !s.isDeleted);
    if (!student) return res.status(404).json({ error: 'Шогирд ёфт нашуд' });

    const today = getDushanbeCurrentDate();
    const receiptSeq = (data.payments.length + 1).toString().padStart(4, '0');
    const yearMonth = today.replace('-', '').substring(0, 6);
    const receiptNumber = `REC-${yearMonth}-${receiptSeq}`;

    const payment = db.mutate((dbData) => {
      const p = {
        id: 'pay-' + Date.now(),
        receiptNumber,
        studentId,
        studentName: student.fullName,
        amount: Number(amount),
        paymentDate: today,
        paymentMethod: paymentMethod || 'CASH',
        membershipPeriod: membershipPeriod || today,
        receivedBy: req.user?.name || 'Ресепшн',
        receivedById: req.user?.userId || 'usr-reception-01',
        notes,
        createdAt: new Date().toISOString(),
      };
      dbData.payments.unshift(p);
      return p;
    });

    res.status(201).json(payment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/payments/:id/receipt', optionalAuthMiddleware, (req, res) => {
  try {
    const data = db.get();
    const payment = data.payments.find((p) => p.id === req.params.id);
    if (!payment) return res.status(404).json({ error: 'Расид ёфт нашуд' });

    const student = data.students.find((s) => s.id === payment.studentId);
    const shift = student ? data.shifts.find((s) => s.id === student.shiftId) : null;

    res.json({
      receipt: payment,
      student,
      shift,
      gym: data.settings,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. ATTENDANCE
// ==========================================
apiRouter.get('/attendance/session', optionalAuthMiddleware, (req, res) => {
  try {
    const { shiftId, date } = req.query;
    if (!shiftId) return res.status(400).json({ error: 'Сменаро интихоб намоед' });

    const result = AttendanceService.getShiftAttendance(shiftId as string, date as string);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/attendance/mark', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const { studentId, shiftId, date, status, notes } = req.body;
    if (!studentId || !shiftId || !status) {
      return res.status(400).json({ error: 'Маълумоти давомотро пур кунед' });
    }

    const today = getDushanbeCurrentDate();
    const record = AttendanceService.markSingle({
      studentId,
      shiftId,
      date: date || today,
      status,
      notes,
      markedById: req.user?.userId || 'usr-coach-01',
      markedByName: req.user?.name || 'Мураббӣ',
    });

    res.json(record);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/attendance/student/:id', optionalAuthMiddleware, (req, res) => {
  try {
    const stats = AttendanceService.getStudentStats(req.params.id);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. SHIFTS & COACHES
// ==========================================
apiRouter.get('/shifts', optionalAuthMiddleware, (req, res) => {
  const data = db.get();
  res.json(data.shifts);
});

apiRouter.post('/shifts', optionalAuthMiddleware, (req, res) => {
  try {
    const { name, daysOfWeek, daysTextTj, daysTextRu, startTime, endTime, coachId, capacity } = req.body;
    const data = db.get();
    const coach = data.coaches.find((c) => c.id === coachId);

    const newShift = db.mutate((dbData) => {
      const shift = {
        id: 'shift-' + Date.now(),
        name,
        daysOfWeek: daysOfWeek || [1, 3, 5],
        daysTextTj,
        daysTextRu: daysTextRu || daysTextTj,
        startTime,
        endTime,
        coachId,
        coachName: coach ? coach.name : 'Мураббӣ',
        capacity: Number(capacity) || 30,
        isActive: true,
      };
      dbData.shifts.push(shift);
      return shift;
    });

    res.status(201).json(newShift);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/coaches', optionalAuthMiddleware, (req, res) => {
  const data = db.get();
  res.json(data.coaches);
});

// ==========================================
// 9. NOTIFICATIONS
// ==========================================
apiRouter.get('/notifications', optionalAuthMiddleware, (req, res) => {
  const logs = NotificationService.getRecentLogs(100);
  res.json(logs);
});

apiRouter.post('/notifications/send', optionalAuthMiddleware, (req, res) => {
  try {
    const { studentId, channel, type, customMessage } = req.body;
    const data = db.get();
    const student = data.students.find((s) => s.id === studentId);

    const log = NotificationService.sendNotification({
      studentId,
      studentName: student?.fullName,
      phone: student?.phone,
      channel: channel || 'SMS',
      type: type || 'EXPIRING_SOON',
      message: customMessage || 'Огоҳинома аз TM BAYONOV MMA',
    });

    res.json(log);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/notifications/templates', optionalAuthMiddleware, (req, res) => {
  res.json(NotificationService.getTemplates());
});

apiRouter.put('/notifications/templates/:id', optionalAuthMiddleware, (req, res) => {
  try {
    const updated = NotificationService.updateTemplate(req.params.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/notifications/telegram-summary', optionalAuthMiddleware, (req, res) => {
  const summary = NotificationService.getDailySummary();
  res.json({ text: summary });
});

// ==========================================
// 10. REPORTS
// ==========================================
apiRouter.get('/reports/finance', optionalAuthMiddleware, (req, res) => {
  try {
    const report = ReportService.getFinanceReport();
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. SETTINGS & AUDIT LOGS
// ==========================================
apiRouter.get('/settings', optionalAuthMiddleware, (req, res) => {
  res.json(db.get().settings);
});

apiRouter.put('/settings', optionalAuthMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.mutate((data) => {
      Object.assign(data.settings, req.body);
      data.auditLogs.unshift({
        id: 'aud-' + Date.now(),
        userId: req.user?.userId || 'usr-admin',
        userName: req.user?.name || 'Админ',
        userRole: 'ADMIN',
        action: 'SETTINGS_UPDATED',
        entity: 'Settings',
        details: 'Танзимоти система навсозӣ карда шуд',
        timestamp: new Date().toISOString(),
      });
      return data.settings;
    });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/audit-logs', optionalAuthMiddleware, (req, res) => {
  const logs = db.get().auditLogs.slice(0, 100);
  res.json(logs);
});
