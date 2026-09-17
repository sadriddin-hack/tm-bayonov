import React from 'react';
import { Modal } from './Modal.js';
import { QrCode, Printer, User, Shield, Phone, Calendar } from 'lucide-react';
import { Student, EnrichedStudent } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { StatusBadge } from './StatusBadge.js';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: EnrichedStudent | Student | null;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, student }) => {
  const { t } = useLanguage();

  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ШИНОСНОМАИ ШОГИРД (STUDENT PASS)" maxWidth="md">
      <div className="flex flex-col items-center gap-6">
        {/* Pass Card */}
        <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white p-6 border border-zinc-700 shadow-2xl relative overflow-hidden">
          {/* Background Accent */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-red-600/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-red-600/10 rounded-full blur-2xl" />

          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-black text-lg text-white shadow-inner">
                TM
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wider">TM BAYONOV</h4>
                <p className="text-[10px] text-red-500 font-bold tracking-widest uppercase">
                  MMA TRAINING CENTER
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold bg-red-500/20 border border-red-500/40 text-red-400 px-2.5 py-1 rounded-md">
              {student.studentCode}
            </span>
          </div>

          {/* Profile & Info */}
          <div className="mt-5 flex items-center gap-4 relative z-10">
            <div className="w-18 h-18 rounded-xl bg-zinc-800 border-2 border-red-600 flex items-center justify-center text-zinc-400 overflow-hidden shrink-0 shadow-md">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-zinc-500" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-base leading-tight text-white">
                {student.fullName}
              </h3>
              <p className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-red-500" /> {student.phone}
              </p>
              {'status' in student && (
                <div className="pt-1">
                  <StatusBadge status={(student as EnrichedStudent).status} />
                </div>
              )}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="mt-6 flex flex-col items-center justify-center p-4 bg-white rounded-xl text-black shadow-inner relative z-10">
            {/* SVG Representation of 2D Matrix / QR Code */}
            <div className="w-36 h-36 flex items-center justify-center p-1 bg-white">
              <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                {/* QR corner squares */}
                <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="11" y="11" width="16" height="16" fill="currentColor" />

                <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="73" y="11" width="16" height="16" fill="currentColor" />

                <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="4" />
                <rect x="11" y="73" width="16" height="16" fill="currentColor" />

                {/* Matrix patterns */}
                <rect x="40" y="8" width="6" height="6" fill="currentColor" />
                <rect x="52" y="8" width="8" height="6" fill="currentColor" />
                <rect x="44" y="20" width="12" height="6" fill="currentColor" />
                <rect x="8" y="44" width="18" height="6" fill="currentColor" />
                <rect x="36" y="36" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="44" y="44" width="12" height="12" fill="#dc2626" />
                <rect x="72" y="44" width="8" height="8" fill="currentColor" />
                <rect x="84" y="44" width="8" height="16" fill="currentColor" />
                <rect x="40" y="72" width="14" height="6" fill="currentColor" />
                <rect x="60" y="72" width="6" height="18" fill="currentColor" />
                <rect x="74" y="74" width="18" height="18" fill="currentColor" />
              </svg>
            </div>
            <p className="mt-2 text-[10px] font-mono text-zinc-600 font-bold uppercase tracking-wider">
              {student.studentCode} • SCAN FOR ATTENDANCE
            </p>
          </div>

          <p className="mt-4 text-center text-[10px] text-zinc-500 font-medium">
            Қабулгоҳи TM BAYONOV MMA барои қайди давомот
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg shadow-md transition-all"
          >
            <Printer className="w-4 h-4" /> Чопи корт
          </button>
        </div>
      </div>
    </Modal>
  );
};
