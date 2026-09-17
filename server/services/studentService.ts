import { db, getDushanbeCurrentDate, formatDateTj } from '../db.js';
import { Student, Membership, StudentGuardian } from '../types.js';
import { MembershipService } from './membershipService.js';
import { NotificationService } from './notificationService.js';

export class StudentService {
  static getStudents(params: {
    search?: string;
    shiftId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const data = db.get();
    const today = getDushanbeCurrentDate();

    // Make sure expiration statuses are refreshed
    let students = data.students.filter((s) => !s.isDeleted);

    // Merge student with membership, shift, debt info
    let enriched = students.map((std) => {
      const membership = data.memberships.find((m) => m.studentId === std.id);
      const shift = data.shifts.find((sh) => sh.id === std.shiftId);
      const debt = data.debts.find((d) => d.studentId === std.id);
      const lastPayment = data.payments.find((p) => p.studentId === std.id);

      return {
        ...std,
        shiftName: shift?.name || 'Муайян нашудааст',
        shiftDays: shift?.daysTextTj || '',
        coachName: shift?.coachName || '',
        membership: membership || null,
        status: membership?.status || 'INACTIVE',
        daysRemaining: membership?.daysRemaining ?? null,
        startDate: membership?.startDate || '',
        endDate: membership?.endDate || '',
        debtAmount: debt ? debt.amount : 0,
        daysOverdue: debt ? debt.daysOverdue : 0,
        lastPaymentDate: lastPayment ? lastPayment.paymentDate : null,
        lastPaymentAmount: lastPayment ? lastPayment.amount : null,
      };
    });

    // Search filter (name, phone, studentCode)
    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      enriched = enriched.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
          s.studentCode.toLowerCase().includes(q)
      );
    }

    // Shift filter
    if (params.shiftId && params.shiftId !== 'ALL') {
      enriched = enriched.filter((s) => s.shiftId === params.shiftId);
    }

    // Status filter
    if (params.status && params.status !== 'ALL') {
      enriched = enriched.filter((s) => s.status === params.status);
    }

    const total = enriched.length;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 50));
    const offset = (page - 1) * limit;

    const items = enriched.slice(offset, offset + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static getStudentById(id: string) {
    const data = db.get();
    const std = data.students.find((s) => s.id === id && !s.isDeleted);
    if (!std) throw new Error('Шогирд ёфт нашуд');

    const membership = data.memberships.find((m) => m.studentId === std.id);
    const shift = data.shifts.find((sh) => sh.id === std.shiftId);
    const debt = data.debts.find((d) => d.studentId === std.id);
    const payments = data.payments.filter((p) => p.studentId === std.id);
    const attendance = data.attendance.filter((a) => a.studentId === std.id);

    return {
      ...std,
      shift,
      membership,
      debt,
      payments,
      attendance,
    };
  }

  static createStudent(params: {
    fullName: string;
    phone: string;
    birthDate: string;
    gender: 'MALE' | 'FEMALE';
    address?: string;
    shiftId: string;
    monthlyPrice: number;
    startDate?: string;
    notes?: string;
    isMinor?: boolean;
    guardian?: StudentGuardian;
    telegramChatId?: string;
    initialPaymentReceived?: boolean;
    paymentMethod?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'OTHER';
    createdByUserId: string;
    createdByUserName: string;
  }): Student {
    const today = getDushanbeCurrentDate();

    return db.mutate((data) => {
      // Validate unique phone
      const cleanPhone = params.phone.replace(/[^0-9]/g, '');
      const existing = data.students.find(
        (s) => !s.isDeleted && s.phone.replace(/[^0-9]/g, '') === cleanPhone
      );
      if (existing) {
        throw new Error(`Шогирд бо рақами телефони ${params.phone} аллакай мавҷуд аст: ${existing.fullName}`);
      }

      // Generate student code
      const codeNumber = 1000 + data.students.length + 1;
      const studentCode = `TB-${codeNumber}`;
      const studentId = 'std-' + Date.now();

      const newStudent: Student = {
        id: studentId,
        studentCode,
        fullName: params.fullName.trim(),
        phone: params.phone.trim(),
        birthDate: params.birthDate,
        gender: params.gender || 'MALE',
        address: params.address,
        registrationDate: today,
        shiftId: params.shiftId,
        monthlyPrice: params.monthlyPrice || 300,
        notes: params.notes,
        isMinor: !!params.isMinor,
        guardian: params.guardian,
        telegramChatId: params.telegramChatId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      data.students.unshift(newStudent);

      // Create initial membership
      const startDate = params.startDate || today;
      const endDate = MembershipService.addMonths(startDate, 1);
      const daysRemaining = MembershipService.diffDays(endDate, today);

      const membership: Membership = {
        id: 'mb-' + Date.now(),
        studentId,
        shiftId: params.shiftId,
        startDate,
        endDate,
        durationMonths: 1,
        price: params.monthlyPrice || 300,
        status: daysRemaining > 3 ? 'ACTIVE' : daysRemaining >= 0 ? 'EXPIRING_SOON' : 'EXPIRED',
        daysRemaining,
        lastPaymentDate: params.initialPaymentReceived ? today : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      data.memberships.push(membership);

      // If initial payment was taken right at reception
      if (params.initialPaymentReceived) {
        const receiptSeq = (data.payments.length + 1).toString().padStart(4, '0');
        const yearMonth = today.replace('-', '').substring(0, 6);
        const receiptNumber = `REC-${yearMonth}-${receiptSeq}`;

        data.payments.unshift({
          id: 'pay-' + Date.now(),
          receiptNumber,
          studentId,
          studentName: newStudent.fullName,
          amount: params.monthlyPrice,
          paymentDate: today,
          paymentMethod: params.paymentMethod || 'CASH',
          membershipPeriod: `${formatDateTj(startDate)} - ${formatDateTj(endDate)}`,
          receivedBy: params.createdByUserName,
          receivedById: params.createdByUserId,
          notes: 'Пардохти аввалин ҳангоми бақайдгирӣ',
          createdAt: new Date().toISOString(),
        });
      }

      // Audit log
      data.auditLogs.unshift({
        id: 'aud-' + Date.now(),
        userId: params.createdByUserId,
        userName: params.createdByUserName,
        userRole: 'RECEPTION',
        action: 'STUDENT_REGISTERED',
        entity: 'Student',
        entityId: studentId,
        details: `Шогирди нав сабт шуд: ${newStudent.fullName} (${studentCode}), Смена: ${params.shiftId}`,
        timestamp: new Date().toISOString(),
      });

      // Welcome Notification
      NotificationService.sendNotification({
        studentId,
        studentName: newStudent.fullName,
        phone: newStudent.phone,
        channel: 'SMS',
        type: 'WELCOME',
        message: `Хуш омадед ба TM BAYONOV MMA, ${newStudent.fullName}! Рақами ID-и шумо: ${studentCode}. Абонемент то ${formatDateTj(endDate)} фаъол аст.`,
      });

      return newStudent;
    });
  }

  static updateStudent(id: string, updates: Partial<Student>, userId: string, userName: string) {
    return db.mutate((data) => {
      const student = data.students.find((s) => s.id === id && !s.isDeleted);
      if (!student) throw new Error('Шогирд ёфт нашуд');

      Object.assign(student, updates, { updatedAt: new Date().toISOString() });

      // If shift changed, update membership shift as well
      if (updates.shiftId) {
        const mb = data.memberships.find((m) => m.studentId === id);
        if (mb) {
          mb.shiftId = updates.shiftId;
          mb.updatedAt = new Date().toISOString();
        }
      }

      data.auditLogs.unshift({
        id: 'aud-' + Date.now(),
        userId,
        userName,
        userRole: 'ADMIN',
        action: 'STUDENT_UPDATED',
        entity: 'Student',
        entityId: id,
        details: `Маълумоти шогирд ${student.fullName} навсозӣ шуд`,
        timestamp: new Date().toISOString(),
      });

      return student;
    });
  }

  static deleteStudent(id: string, userId: string, userName: string) {
    return db.mutate((data) => {
      const student = data.students.find((s) => s.id === id && !s.isDeleted);
      if (!student) throw new Error('Шогирд ёфт нашуд');

      student.isDeleted = true;
      student.updatedAt = new Date().toISOString();

      data.auditLogs.unshift({
        id: 'aud-' + Date.now(),
        userId,
        userName,
        userRole: 'ADMIN',
        action: 'STUDENT_DELETED',
        entity: 'Student',
        entityId: id,
        details: `Шогирд ${student.fullName} (${student.studentCode}) бекор/нест карда шуд`,
        timestamp: new Date().toISOString(),
      });

      return { success: true, message: 'Шогирд бекор карда шуд' };
    });
  }
}
