import React, { useState, useEffect } from 'react';
import {
  Layers,
  Clock,
  Users,
  Calendar,
  Shield,
  ArrowRight,
  CalendarCheck,
  Plus,
  UserCheck,
} from 'lucide-react';
import { Shift, Coach } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { api } from '../../api/client.js';

interface ShiftsViewProps {
  onOpenAttendance: (shiftId: string) => void;
  onFilterStudentsByShift: (shiftId: string) => void;
}

export const ShiftsView: React.FC<ShiftsViewProps> = ({
  onOpenAttendance,
  onFilterStudentsByShift,
}) => {
  const { t } = useLanguage();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([api.getShifts(), api.getCoaches()])
      .then(([shiftsData, coachesData]) => {
        setShifts(shiftsData);
        setCoaches(coachesData);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
          {t.shiftsTitle}
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          Ҷадвали сменаҳои тамринии толори TM BAYONOV MMA, рӯзҳои тамрин ва мураббиён
        </p>
      </div>

      {/* Shifts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shifts.map((shift) => {
          const occupancyRate = Math.round((shift.studentCount / shift.maxCapacity) * 100);

          return (
            <div
              key={shift.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:border-red-500/40 transition-all flex flex-col justify-between space-y-6"
            >
              <div>
                {/* Header tag */}
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-extrabold text-xs tracking-wider">
                    {shift.name}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-red-500" />
                    {shift.startTime} – {shift.endTime}
                  </span>
                </div>

                {/* Days */}
                <div className="mt-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span className="font-extrabold text-sm text-zinc-900 dark:text-white">
                    {shift.daysTextTj}
                  </span>
                </div>

                {/* Coach info */}
                <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      Сармураббии смена:
                    </span>
                    <p className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200">
                      {shift.coachName}
                    </p>
                  </div>
                  <Shield className="w-5 h-5 text-red-600" />
                </div>

                {/* Occupancy bar */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-500">Шогирдони сабтшуда:</span>
                    <span className="text-zinc-900 dark:text-white">
                      {shift.studentCount} / {shift.maxCapacity} ҷой ({occupancyRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        occupancyRate > 85 ? 'bg-amber-500' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                <button
                  onClick={() => onFilterStudentsByShift(shift.id)}
                  className="flex-1 py-2.5 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-xs transition-colors text-center"
                >
                  Рӯйхати шогирдон
                </button>
                <button
                  onClick={() => onOpenAttendance(shift.id)}
                  className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>Қайди давомот</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coaches Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white uppercase">
          Мураббиёни толор (Coaching Staff)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coaches.map((c) => (
            <div
              key={c.id}
              className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-extrabold text-red-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-white">
                    {c.name}
                  </h4>
                  <p className="text-[11px] text-red-600 font-bold uppercase">{c.roleTj}</p>
                </div>
              </div>

              <div className="pt-2 text-xs space-y-1 text-zinc-500">
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">Ихтисос:</strong> {c.specialty}
                </p>
                <p>
                  <strong className="text-zinc-700 dark:text-zinc-300">Таҷриба:</strong> {c.experienceYears} сол
                </p>
                <p className="font-mono">
                  <strong className="text-zinc-700 dark:text-zinc-300">Тел:</strong> {c.phone}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
