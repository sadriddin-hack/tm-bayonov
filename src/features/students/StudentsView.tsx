import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  User,
  RotateCw,
  QrCode,
  Edit2,
  Trash2,
  Eye,
  Phone,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { EnrichedStudent, Shift, Student } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { api } from '../../api/client.js';

interface StudentsViewProps {
  initialStatusFilter?: string;
  onOpenAddStudent: () => void;
  onOpenProfile: (student: EnrichedStudent) => void;
  onOpenRenew: (student: EnrichedStudent) => void;
  onOpenQr: (student: EnrichedStudent) => void;
  onOpenEdit: (student: Student) => void;
  onDeleteStudent: (student: EnrichedStudent) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  initialStatusFilter = '',
  onOpenAddStudent,
  onOpenProfile,
  onOpenRenew,
  onOpenQr,
  onOpenEdit,
  onDeleteStudent,
}) => {
  const { t } = useLanguage();
  const { canDeleteStudent } = useAuth();

  const [students, setStudents] = useState<EnrichedStudent[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [search, setSearch] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(initialStatusFilter);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.getShifts().then(setShifts).catch(console.error);
  }, []);

  useEffect(() => {
    if (initialStatusFilter) {
      setSelectedStatus(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.getStudents({
        search,
        shiftId: selectedShift || undefined,
        status: selectedStatus || undefined,
        page,
        limit: 15,
      });
      setStudents(res.items || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, selectedShift, selectedStatus, page]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
            {t.studentsListTitle}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Рӯйхати умумии варзишгарон ва ҳолати абонементҳои онҳо ({totalCount} нафар)
          </p>
        </div>

        <button
          onClick={onOpenAddStudent}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.btnAddStudent}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-red-500 font-medium text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Shift Select */}
          <div>
            <select
              value={selectedShift}
              onChange={(e) => {
                setSelectedShift(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none focus:border-red-500 text-zinc-900 dark:text-zinc-100"
            >
              <option value="">Ҳамаи сменаҳо</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.daysTextTj})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold focus:outline-none focus:border-red-500 text-zinc-900 dark:text-zinc-100"
            >
              <option value="">Ҳамаи ҳолатҳо (All)</option>
              <option value="ACTIVE">🟢 Фаъол (ACTIVE)</option>
              <option value="EXPIRING_SOON">🟡 Муҳлаташ наздик (EXPIRING)</option>
              <option value="DEBTOR">🔴 Қарздор (DEBTOR)</option>
              <option value="EXPIRED">🟣 Муҳлат гузашта (EXPIRED)</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <span className="text-[11px] font-bold text-zinc-400 mr-1 uppercase">Филтр:</span>
          {[
            { id: '', label: 'Ҳама' },
            { id: 'ACTIVE', label: 'Фаъол' },
            { id: 'EXPIRING_SOON', label: 'Муҳлаташ наздик' },
            { id: 'DEBTOR', label: 'Қарздорон' },
            { id: 'EXPIRED', label: 'Муҳлат гузашта' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                setSelectedStatus(pill.id);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                selectedStatus === pill.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-400 text-xs font-bold">
            {t.loading}
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-zinc-500 font-bold text-sm">Ҳеҷ шогирде ёфт нашуд</p>
            <p className="text-zinc-400 text-xs">Филтрҳоро иваз кунед ё шогирди нав илова намоед</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 uppercase font-bold text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4">Шогирд (ФИО / ID)</th>
                  <th className="p-4">Телефон</th>
                  <th className="p-4">Смена ва рӯзҳо</th>
                  <th className="p-4">Ҳолат</th>
                  <th className="p-4">Муҳлат (Анҷом)</th>
                  <th className="p-4">Нарх</th>
                  <th className="p-4 text-right">Амалҳо</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {students.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Student Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 shrink-0">
                          {st.photoUrl ? (
                            <img
                              src={st.photoUrl}
                              alt=""
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            st.fullName.charAt(0)
                          )}
                        </div>
                        <div>
                          <button
                            onClick={() => onOpenProfile(st)}
                            className="font-extrabold text-sm text-zinc-900 dark:text-white hover:text-red-600 transition-colors text-left"
                          >
                            {st.fullName}
                          </button>
                          <p className="font-mono text-[11px] text-zinc-400 font-bold">
                            {st.studentCode}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="p-4 font-mono font-medium text-zinc-700 dark:text-zinc-300">
                      {st.phone}
                    </td>

                    {/* Shift */}
                    <td className="p-4">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                        {st.shiftName || '—'}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {st.shiftDaysTj || ''}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <StatusBadge status={st.status} daysRemaining={st.daysRemaining} />
                    </td>

                    {/* Expiration Date */}
                    <td className="p-4">
                      <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                        {st.endDate || '—'}
                      </span>
                      {st.daysRemaining !== undefined && (
                        <span
                          className={`text-[10px] font-bold ${
                            st.daysRemaining > 3
                              ? 'text-emerald-600'
                              : st.daysRemaining >= 0
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {st.daysRemaining > 0
                            ? `${st.daysRemaining} рӯз монд`
                            : st.daysRemaining === 0
                            ? 'Имрӯз тамом мешавад'
                            : `${Math.abs(st.daysRemaining)} рӯз пеш гузаштааст`}
                        </span>
                      )}
                    </td>

                    {/* Monthly Price */}
                    <td className="p-4 font-black text-zinc-900 dark:text-white">
                      {st.monthlyPrice} TJS
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenProfile(st)}
                          title="Профил"
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenQr(st)}
                          title="Шиноснома / QR Code"
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenRenew(st)}
                          title={t.btnPayAndRenew}
                          className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm font-bold flex items-center gap-1 text-[11px] px-2.5"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Тамдид</span>
                        </button>
                        <button
                          onClick={() => onOpenEdit(st)}
                          title="Таҳрир"
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {canDeleteStudent && (
                          <button
                            onClick={() => onDeleteStudent(st)}
                            title="Нобуд кардан"
                            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">
              Саҳифаи {page} аз {totalPages} (ҳамагӣ {totalCount})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 font-bold"
              >
                Қаблӣ
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 font-bold"
              >
                Баъдӣ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
