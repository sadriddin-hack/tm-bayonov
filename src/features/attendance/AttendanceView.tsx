import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Search,
  Scan,
  Zap,
  Users,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  Shift,
  AttendanceSessionResponse,
  AttendanceStatus,
  MembershipStatus,
} from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { api } from '../../api/client.js';

interface AttendanceViewProps {
  initialShiftId?: string;
  onOpenRenew: (student: any) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  initialShiftId,
  onOpenRenew,
}) => {
  const { t } = useLanguage();
  const { canMarkAttendance } = useAuth();

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>(initialShiftId || '');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-17');
  const [sessionData, setSessionData] = useState<AttendanceSessionResponse | null>(null);
  const [search, setSearch] = useState('');
  const [quickScanCode, setQuickScanCode] = useState('');
  const [scanMessage, setScanMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.getShifts().then((data) => {
      setShifts(data);
      if (!selectedShiftId && data.length > 0) {
        setSelectedShiftId(initialShiftId || data[0].id);
      }
    });
  }, [initialShiftId]);

  const loadSession = async () => {
    if (!selectedShiftId) return;
    setIsLoading(true);
    try {
      const res = await api.getAttendanceSession(selectedShiftId, selectedDate);
      setSessionData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [selectedShiftId, selectedDate]);

  const handleMark = async (studentId: string, status: AttendanceStatus, notes?: string) => {
    if (!selectedShiftId || !canMarkAttendance) return;

    try {
      await api.markAttendance({
        studentId,
        shiftId: selectedShiftId,
        date: selectedDate,
        status,
        notes,
      });

      // Optimistic update in UI
      if (sessionData) {
        const updatedStudents = studentsList.map((item) => {
          if (item.student.id === studentId) {
            return {
              ...item,
              record: {
                ...(item.record || ({} as any)),
                id: item.record?.id || 'att-' + Date.now(),
                studentId,
                shiftId: selectedShiftId,
                date: selectedDate,
                status,
                markedBy: 'Маъмур',
                timestamp: new Date().toISOString(),
              },
            };
          }
          return item;
        });

        // Recalculate stats
        const present = updatedStudents.filter((s) => s.record?.status === 'PRESENT').length;
        const absent = updatedStudents.filter((s) => s.record?.status === 'ABSENT').length;
        const late = updatedStudents.filter((s) => s.record?.status === 'LATE').length;
        const excused = updatedStudents.filter((s) => s.record?.status === 'EXCUSED').length;

        setSessionData({
          ...sessionData,
          students: updatedStudents,
          stats: {
            total: updatedStudents.length,
            present,
            absent,
            late,
            excused,
            rate: Math.round((present / (updatedStudents.length || 1)) * 100),
          },
        });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const rawStudents = sessionData?.students || [];
  const studentsList =
    rawStudents.length > 0
      ? rawStudents
      : (sessionData?.roster || []).map((r) => ({
          student: {
            id: r.studentId,
            studentCode: r.studentCode,
            fullName: r.fullName,
            phone: r.phone,
            tariffId: 't-standard',
            shiftId: selectedShiftId,
            joinedDate: '2026-01-01',
            birthDate: '2005-01-01',
            isDeleted: false,
          },
          membership: {
            id: 'mb-' + r.studentId,
            studentId: r.studentId,
            tariffId: 't-standard',
            startDate: '2026-09-01',
            endDate: '2026-10-01',
            daysRemaining: 14,
            status: r.membershipStatus,
            isSuspended: false,
            priceSnapshot: 300,
            autoRenewal: false,
            lastPaymentDate: '2026-09-01',
          },
          record: r.attendanceStatus
            ? {
                id: r.recordId || 'rec-' + r.studentId,
                studentId: r.studentId,
                shiftId: selectedShiftId,
                date: selectedDate,
                status: r.attendanceStatus,
                notes: r.notes,
                markedAt: r.markedAt || '',
                markedBy: r.markedBy || 'Маъмур',
              }
            : null,
        }));

  const stats = sessionData?.stats || {
    total: sessionData?.summary?.total || studentsList.length,
    present: sessionData?.summary?.present || 0,
    absent: sessionData?.summary?.absent || 0,
    late: sessionData?.summary?.late || 0,
    excused: sessionData?.summary?.excused || 0,
    rate: sessionData?.summary?.total
      ? Math.round((sessionData.summary.present / sessionData.summary.total) * 100)
      : 0,
  };

  // Quick scanner handler
  const handleQuickScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = quickScanCode.trim().toUpperCase();
    if (!code || !sessionData) return;

    const match = studentsList.find(
      (s) =>
        s.student.studentCode.toUpperCase() === code ||
        s.student.fullName.toUpperCase().includes(code)
    );

    if (match) {
      await handleMark(match.student.id, 'PRESENT');
      setScanMessage({
        text: `✓ ${match.student.fullName} (${match.student.studentCode}) - ҲОЗИР сабт шуд!`,
        success: true,
      });
      setQuickScanCode('');
    } else {
      setScanMessage({
        text: `Шогирд бо коди "${code}" дар ин смена ёфт нашуд!`,
        success: false,
      });
    }

    setTimeout(() => setScanMessage(null), 4000);
  };

  const filteredStudents = studentsList.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.student.fullName.toLowerCase().includes(q) ||
      item.student.studentCode.toLowerCase().includes(q) ||
      item.student.phone.includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
            {t.attendanceTitle}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Қайди давомоти шогирдон дар тамринҳои MMA аз рӯи сменаҳо ва сана
          </p>
        </div>
      </div>

      {/* Control bar: Shift Select + Date Select + Quick Barcode Scanner */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Shift Select */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">
              Интихоби Смена:
            </label>
            <select
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold focus:outline-none focus:border-red-500 text-zinc-900 dark:text-zinc-100"
            >
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.daysTextTj}) • {s.startTime}-{s.endTime}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">
              Санаи тамрин:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none focus:border-red-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Quick Scanner Barcode/ID input */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-[11px] font-bold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wider flex items-center gap-1">
              <Scan className="w-3.5 h-3.5" />
              <span>Скан / Воридкунии коди шогирд:</span>
            </label>
            <form onSubmit={handleQuickScan} className="flex gap-2">
              <input
                type="text"
                value={quickScanCode}
                onChange={(e) => setQuickScanCode(e.target.value)}
                placeholder="Масалан: TB-1001"
                className="w-full px-3 py-2 text-xs bg-red-500/5 dark:bg-red-950/30 border border-red-500/30 rounded-xl font-mono font-bold focus:outline-none focus:border-red-500 text-zinc-900 dark:text-zinc-100 uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shrink-0 shadow-sm"
              >
                Ҳозир
              </button>
            </form>
          </div>
        </div>

        {scanMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              scanMessage.success
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
            }`}
          >
            {scanMessage.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>{scanMessage.text}</span>
          </div>
        )}
      </div>

      {/* Session KPIs */}
      {sessionData && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-zinc-400">Ҳамагӣ дар гурӯҳ</span>
            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
              {stats.total}
            </p>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-emerald-600">ҲОЗИР</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {stats.present}
            </p>
          </div>

          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-rose-600">ҒОИБ</span>
            <p className="text-2xl font-black text-rose-600 mt-1">
              {stats.absent}
            </p>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
            <span className="text-[10px] font-bold uppercase text-amber-600">ДЕР</span>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {stats.late}
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase text-zinc-400">Фоизи иштирок</span>
            <p className="text-2xl font-black text-red-600 mt-1">
              {stats.rate}%
            </p>
          </div>
        </div>
      )}

      {/* Search inside session */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Филтр аз рӯи номи шогирд ё рамз..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-red-500 text-zinc-900 dark:text-zinc-100 font-medium"
          />
        </div>
      </div>

      {/* Attendance Students Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 text-xs font-bold">{t.loading}</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            Дар ин смена шогирде ёфт нашуд
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4">Шогирд (ID)</th>
                  <th className="p-4">Ҳолати абонемент</th>
                  <th className="p-4">Иҷозати тамрин</th>
                  <th className="p-4 text-center">Қайди ҳолат</th>
                  <th className="p-4 text-right">Қайдҳо</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredStudents.map(({ student, membership, record }) => {
                  const status = record?.status;
                  const canTrain = membership.status === 'ACTIVE' || membership.status === 'EXPIRING_SOON';

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors ${
                        !canTrain ? 'bg-rose-500/5' : ''
                      }`}
                    >
                      {/* Student Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-white block">
                              {student.fullName}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-400 font-bold">
                              {student.studentCode} • {student.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Membership Status Badge */}
                      <td className="p-4">
                        <StatusBadge
                          status={membership.status}
                          daysRemaining={membership.daysRemaining}
                        />
                      </td>

                      {/* Access Permission */}
                      <td className="p-4">
                        {canTrain ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ИҶОЗАТ
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                              <XCircle className="w-3.5 h-3.5" /> ҚАРЗДОР
                            </span>
                            <button
                              onClick={() => onOpenRenew(student)}
                              className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                            >
                              Тамдид
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Attendance Buttons */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Present */}
                          <button
                            onClick={() => handleMark(student.id, 'PRESENT')}
                            disabled={!canMarkAttendance}
                            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                              status === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {t.present}
                          </button>

                          {/* Absent */}
                          <button
                            onClick={() => handleMark(student.id, 'ABSENT')}
                            disabled={!canMarkAttendance}
                            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                              status === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-md'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            {t.absent}
                          </button>

                          {/* Late */}
                          <button
                            onClick={() => handleMark(student.id, 'LATE')}
                            disabled={!canMarkAttendance}
                            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                              status === 'LATE'
                                ? 'bg-amber-600 text-white shadow-md'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            {t.late}
                          </button>

                          {/* Excused */}
                          <button
                            onClick={() => handleMark(student.id, 'EXCUSED')}
                            disabled={!canMarkAttendance}
                            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                              status === 'EXCUSED'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                          >
                            {t.excused}
                          </button>
                        </div>
                      </td>

                      {/* Notes / Marked By */}
                      <td className="p-4 text-right">
                        {record?.markedBy && (
                          <span className="text-[10px] text-zinc-400 block font-mono">
                            {record.markedBy}
                          </span>
                        )}
                        <span className="text-[11px] text-zinc-500 italic">
                          {record?.notes || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
