import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.js';
import { EnrichedStudent, Student, Payment, AttendanceRecord } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { api } from '../../api/client.js';
import {
  User,
  Phone,
  Calendar,
  CreditCard,
  QrCode,
  RotateCw,
  Send,
  Edit2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: EnrichedStudent | Student | null;
  onOpenRenew: (student: EnrichedStudent | Student) => void;
  onOpenQr: (student: EnrichedStudent | Student) => void;
  onOpenEdit: (student: Student) => void;
  onSendReminder: (student: Student) => void;
  onViewReceipt: (paymentId: string) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onOpenRenew,
  onOpenQr,
  onOpenEdit,
  onSendReminder,
  onViewReceipt,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'membership' | 'payments' | 'attendance'>('membership');
  const [fullDetails, setFullDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (student && isOpen) {
      setIsLoading(true);
      api
        .getStudentById(student.id)
        .then((data) => setFullDetails(data))
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [student, isOpen]);

  if (!student) return null;

  const isEnriched = 'status' in student;
  const status = isEnriched ? (student as EnrichedStudent).status : fullDetails?.membership?.status || 'ACTIVE';
  const daysRemaining = isEnriched ? (student as EnrichedStudent).daysRemaining : fullDetails?.membership?.daysRemaining;

  const payments: Payment[] = fullDetails?.payments || [];
  const attendance: AttendanceRecord[] = fullDetails?.attendance || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ПРОФИЛИ ШОГИРД (STUDENT PROFILE)" maxWidth="2xl">
      <div className="space-y-6 text-zinc-900 dark:text-zinc-100">
        {/* Header Profile Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700/60">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-700 border-2 border-red-600 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {student.photoUrl ? (
                <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-zinc-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold">{student.fullName}</h3>
                <span className="font-mono text-xs font-bold bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded">
                  {student.studentCode}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-red-500" /> {student.phone}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge status={status} daysRemaining={daysRemaining} />
                {student.isMinor && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Ноболиғ (зери 18)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => onOpenQr(student)}
              title="Шиноснома / QR Code"
              className="p-2 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors shadow-sm"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSendReminder(student)}
              title="Ирсоли ёдраскунӣ (SMS)"
              className="p-2 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenEdit(student)}
              title="Таҳрир"
              className="p-2 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors shadow-sm"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenRenew(student)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              {t.btnPayAndRenew}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('membership')}
            className={`px-4 py-2.5 border-b-2 transition-all ${
              activeTab === 'membership'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Абонемент ва Смена
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 border-b-2 transition-all ${
              activeTab === 'payments'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Таърихи пардохтҳо ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 border-b-2 transition-all ${
              activeTab === 'attendance'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Давомот ({attendance.length})
          </button>
        </div>

        {/* TAB 1: Membership & Shift Info */}
        {activeTab === 'membership' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
              <h4 className="font-extrabold uppercase text-zinc-400 text-[10px] tracking-wider">
                Маълумоти абонемент
              </h4>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Ҳолати абонемент:</span>
                <StatusBadge status={status} daysRemaining={daysRemaining} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Санаи оғоз:</span>
                <span className="font-bold font-mono">
                  {fullDetails?.membership?.startDate || '17.09.2026'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Санаи анҷом (Муҳлат):</span>
                <span className="font-bold font-mono text-red-600 dark:text-red-400 text-sm">
                  {fullDetails?.membership?.endDate || '17.10.2026'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Рӯзҳои боқимонда:</span>
                <span className="font-bold">
                  {daysRemaining !== undefined && daysRemaining !== null
                    ? `${daysRemaining} рӯз`
                    : '30 рӯз'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Нархи моҳона:</span>
                <span className="font-bold text-sm">
                  {student.monthlyPrice} сомонӣ
                </span>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-3">
              <h4 className="font-extrabold uppercase text-zinc-400 text-[10px] tracking-wider">
                Смена ва Машқҳо
              </h4>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Смена:</span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  {fullDetails?.shift?.name || 'СМЕНА 1 (Тоқ)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Рӯзҳои машқ:</span>
                <span className="font-medium text-right">
                  {fullDetails?.shift?.daysTextTj || 'Душанбе • Чоршанбе • Ҷумъа'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Вақти тамрин:</span>
                <span className="font-mono font-bold">
                  {fullDetails?.shift?.startTime || '18:00'} - {fullDetails?.shift?.endTime || '19:30'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Сармураббӣ:</span>
                <span className="font-bold">
                  {fullDetails?.shift?.coachName || 'Баёнов Таҳмурас'}
                </span>
              </div>
              {student.guardian && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="text-zinc-500 block mb-0.5">Волидайн:</span>
                  <span className="font-bold">
                    {student.guardian.name} ({student.guardian.phone})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Payment History */}
        {activeTab === 'payments' && (
          <div className="space-y-3">
            {payments.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 text-xs">
                То ҳол пардохте сабт нашудааст
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3">Квитансия</th>
                      <th className="p-3">Сана</th>
                      <th className="p-3">Давра</th>
                      <th className="p-3">Усул</th>
                      <th className="p-3">Маблағ</th>
                      <th className="p-3 text-right">Расид</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3 font-mono font-bold text-red-600">{p.receiptNumber}</td>
                        <td className="p-3">{p.paymentDate}</td>
                        <td className="p-3">{p.membershipPeriod}</td>
                        <td className="p-3 uppercase">{p.paymentMethod}</td>
                        <td className="p-3 font-bold text-sm">{p.amount} TJS</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onViewReceipt(p.id)}
                            className="px-2.5 py-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-700 rounded-lg hover:bg-zinc-300 transition-colors"
                          >
                            Чоп
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Attendance */}
        {activeTab === 'attendance' && (
          <div className="space-y-3">
            {attendance.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 text-xs">
                Сабти давомот вуҷуд надорад
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-3">Сана</th>
                      <th className="p-3">Ҳолат</th>
                      <th className="p-3">Қайд</th>
                      <th className="p-3">Қайдкунанда</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {attendance.map((a) => (
                      <tr key={a.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="p-3 font-mono font-bold">{a.date}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              a.status === 'PRESENT'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : a.status === 'ABSENT'
                                ? 'bg-rose-500/10 text-rose-600'
                                : a.status === 'LATE'
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-blue-500/10 text-blue-600'
                            }`}
                          >
                            {a.status === 'PRESENT'
                              ? 'ҲОЗИР'
                              : a.status === 'ABSENT'
                              ? 'ҒОИБ'
                              : a.status === 'LATE'
                              ? 'ДЕР'
                              : 'САБАБНОК'}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">{a.notes || '—'}</td>
                        <td className="p-3">{a.markedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
