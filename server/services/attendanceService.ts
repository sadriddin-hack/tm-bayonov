import { db, getDushanbeCurrentDate } from '../db.js';
import { AttendanceRecord, AttendanceStatus } from '../types.js';

export class AttendanceService {
  static getShiftAttendance(shiftId: string, dateStr?: string) {
    const data = db.get();
    const targetDate = dateStr || getDushanbeCurrentDate();

    // Get active students assigned to this shift
    const studentsInShift = data.students.filter(
      (s) => !s.isDeleted && s.shiftId === shiftId
    );

    // Get records for target date
    const records = data.attendance.filter(
      (a) => a.shiftId === shiftId && a.date === targetDate
    );

    // Combine
    const roster = studentsInShift.map((std) => {
      const rec = records.find((r) => r.studentId === std.id);
      const mb = data.memberships.find((m) => m.studentId === std.id);
      const isDebtor = data.debts.some((d) => d.studentId === std.id);

      return {
        studentId: std.id,
        studentCode: std.studentCode,
        fullName: std.fullName,
        phone: std.phone,
        membershipStatus: mb?.status || 'INACTIVE',
        isDebtor,
        attendanceStatus: rec?.status || null,
        recordId: rec?.id || null,
        notes: rec?.notes || '',
        markedAt: rec?.markedAt || null,
        markedBy: rec?.markedBy || null,
      };
    });

    const shift = data.shifts.find((s) => s.id === shiftId);

    const summary = {
      total: roster.length,
      present: roster.filter((r) => r.attendanceStatus === 'PRESENT').length,
      absent: roster.filter((r) => r.attendanceStatus === 'ABSENT').length,
      late: roster.filter((r) => r.attendanceStatus === 'LATE').length,
      excused: roster.filter((r) => r.attendanceStatus === 'EXCUSED').length,
      unmarked: roster.filter((r) => !r.attendanceStatus).length,
    };

    const students = studentsInShift.map((std) => {
      const rec = records.find((r) => r.studentId === std.id);
      const mb = data.memberships.find((m) => m.studentId === std.id) || {
        id: 'mb-' + std.id,
        studentId: std.id,
        shiftId: std.shiftId,
        startDate: std.registrationDate,
        endDate: std.registrationDate,
        durationMonths: 1,
        price: std.monthlyPrice || 300,
        daysRemaining: 0,
        status: 'INACTIVE' as const,
        lastPaymentDate: std.registrationDate,
        createdAt: std.createdAt,
        updatedAt: std.updatedAt,
      };
      return {
        student: std,
        membership: mb,
        record: rec
          ? {
              ...rec,
              timestamp: rec.markedAt || new Date().toISOString(),
            }
          : null,
      };
    });

    const stats = {
      total: roster.length,
      present: summary.present,
      absent: summary.absent,
      late: summary.late,
      excused: summary.excused,
      rate: roster.length > 0 ? Math.round((summary.present / roster.length) * 100) : 0,
    };

    return {
      shift,
      date: targetDate,
      roster,
      summary,
      students,
      stats,
    };
  }

  static markSingle(params: {
    studentId: string;
    shiftId: string;
    date: string;
    status: AttendanceStatus;
    notes?: string;
    markedById: string;
    markedByName: string;
  }) {
    return db.mutate((data) => {
      let record = data.attendance.find(
        (a) =>
          a.studentId === params.studentId &&
          a.shiftId === params.shiftId &&
          a.date === params.date
      );

      const now = new Date().toISOString();

      if (record) {
        record.status = params.status;
        record.notes = params.notes !== undefined ? params.notes : record.notes;
        record.markedBy = params.markedByName;
        record.markedById = params.markedById;
        record.markedAt = now;
      } else {
        record = {
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          studentId: params.studentId,
          shiftId: params.shiftId,
          date: params.date,
          status: params.status,
          notes: params.notes,
          markedBy: params.markedByName,
          markedById: params.markedById,
          markedAt: now,
        };
        data.attendance.push(record);
      }

      return record;
    });
  }

  static getStudentStats(studentId: string) {
    const data = db.get();
    const records = data.attendance.filter((a) => a.studentId === studentId);

    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const excused = records.filter((r) => r.status === 'EXCUSED').length;

    const rate = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0;

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate: rate,
      recentRecords: records.slice(-10).reverse(),
    };
  }
}
