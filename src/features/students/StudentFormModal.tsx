import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal.js';
import { Shift, Student } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { api } from '../../api/client.js';
import { UserPlus, UserCheck, Shield, Phone, MapPin, Calendar } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
  studentToEdit?: Student | null;
  onSuccess: () => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  shifts,
  studentToEdit,
  onSuccess,
}) => {
  const { t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+992');
  const [birthDate, setBirthDate] = useState('2005-01-01');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [address, setAddress] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState(300);
  const [startDate, setStartDate] = useState('2026-09-17');
  const [isMinor, setIsMinor] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('+992');
  const [guardianRelation, setGuardianRelation] = useState('Падар');
  const [initialPaymentReceived, setInitialPaymentReceived] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'BANK_TRANSFER'>('CASH');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shifts.length > 0 && !shiftId) {
      setShiftId(shifts[0].id);
    }
  }, [shifts, shiftId]);

  useEffect(() => {
    if (studentToEdit) {
      setFullName(studentToEdit.fullName);
      setPhone(studentToEdit.phone);
      setBirthDate(studentToEdit.birthDate);
      setGender(studentToEdit.gender);
      setAddress(studentToEdit.address || '');
      setShiftId(studentToEdit.shiftId);
      setMonthlyPrice(studentToEdit.monthlyPrice);
      setIsMinor(studentToEdit.isMinor);
      if (studentToEdit.guardian) {
        setGuardianName(studentToEdit.guardian.name);
        setGuardianPhone(studentToEdit.guardian.phone);
        setGuardianRelation(studentToEdit.guardian.relation);
      }
      setNotes(studentToEdit.notes || '');
    } else {
      setFullName('');
      setPhone('+992');
      setBirthDate('2005-01-01');
      setGender('MALE');
      setAddress('');
      setMonthlyPrice(300);
      setIsMinor(false);
      setGuardianName('');
      setGuardianPhone('+992');
      setNotes('');
      setInitialPaymentReceived(true);
    }
  }, [studentToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate phone
    if (!phone || phone.length < 9) {
      setError('Рақами телефонро дуруст ворид кунед (масалан: +992901112233)');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: any = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        birthDate,
        gender,
        address: address.trim() || undefined,
        shiftId,
        monthlyPrice: Number(monthlyPrice),
        startDate,
        notes: notes.trim() || undefined,
        isMinor,
        guardian: isMinor
          ? {
              name: guardianName.trim(),
              phone: guardianPhone.trim(),
              relation: guardianRelation.trim(),
            }
          : undefined,
      };

      if (!studentToEdit) {
        payload.initialPaymentReceived = initialPaymentReceived;
        payload.paymentMethod = paymentMethod;
        await api.createStudent(payload);
      } else {
        await api.updateStudent(studentToEdit.id, payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t.errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? t.editStudentTitle : t.newStudentTitle}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-zinc-900 dark:text-zinc-100">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
              {t.fullName} *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Масалан: Садриддин Зокиров"
              className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
              {t.phone} *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+992900000000"
              className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono font-medium focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
              {t.birthDate}
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
              {t.gender}
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none focus:border-red-500"
            >
              <option value="MALE">{t.male}</option>
              <option value="FEMALE">{t.female}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
              {t.monthlyPrice}
            </label>
            <input
              type="number"
              value={monthlyPrice}
              onChange={(e) => setMonthlyPrice(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Shift Assignment */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
            {t.selectShift} *
          </label>
          <select
            value={shiftId}
            onChange={(e) => setShiftId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-semibold text-red-600 dark:text-red-400 focus:outline-none focus:border-red-500"
          >
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} • {s.daysTextTj} ({s.startTime} - {s.endTime}) • Мураббӣ: {s.coachName}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
            {t.address}
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Масалан: ш. Душанбе, н. Сино, кӯч. Борбад"
            className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Minor Guardian Toggle */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isMinor}
              onChange={(e) => setIsMinor(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {t.isMinor}
            </span>
          </label>

          {isMinor && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-700/60">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  {t.guardianName} *
                </label>
                <input
                  type="text"
                  required={isMinor}
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="ФИО Волидайн"
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  {t.guardianPhone} *
                </label>
                <input
                  type="text"
                  required={isMinor}
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="+992..."
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  {t.guardianRelation}
                </label>
                <input
                  type="text"
                  value={guardianRelation}
                  onChange={(e) => setGuardianRelation(e.target.value)}
                  placeholder="Падар / Модар"
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* Initial Payment at Registration */}
        {!studentToEdit && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={initialPaymentReceived}
                onChange={(e) => setInitialPaymentReceived(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
              />
              <span className="text-xs font-extrabold text-red-700 dark:text-red-400">
                {t.initialPaymentTaken} ({monthlyPrice} сомонӣ)
              </span>
            </label>

            {initialPaymentReceived && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  {t.paymentMethod}:
                </span>
                {(['CASH', 'CARD', 'BANK_TRANSFER'] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      paymentMethod === m
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {m === 'CASH' ? t.cash : m === 'CARD' ? t.card : t.bankTransfer}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1 uppercase tracking-wide">
            {t.notes}
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Масалан: Таҷрибаи қаблӣ дар самбо, омодагӣ ба чемпионати ҷумҳурӣ..."
            className="w-full px-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all tracking-wider disabled:opacity-50"
          >
            {isSubmitting ? t.loading : t.save}
          </button>
        </div>
      </form>
    </Modal>
  );
};
