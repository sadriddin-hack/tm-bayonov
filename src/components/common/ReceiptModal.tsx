import React from 'react';
import { Modal } from './Modal.js';
import { Printer, CheckCircle2, ShieldCheck, Share2 } from 'lucide-react';
import { Payment, Student, Shift, GymSettings } from '../../types/index.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  student?: Student | null;
  shift?: Shift | null;
  gym?: GymSettings | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  student,
  shift,
  gym,
}) => {
  const { t } = useLanguage();

  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.receiptTitle} maxWidth="md">
      <div className="flex flex-col gap-6" id="receipt-print-area">
        {/* Printable Receipt Card */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl relative overflow-hidden font-sans text-zinc-900 dark:text-zinc-100 shadow-sm">
          {/* Top MMA Stamp */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                TM
              </div>
              <div>
                <h4 className="font-extrabold text-base tracking-wider uppercase">
                  {gym?.gymName || 'TM BAYONOV'}
                </h4>
                <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 tracking-widest uppercase">
                  {gym?.subtitle || 'MMA TRAINING CENTER'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> ПАРДОХТ ШУД
              </span>
              <p className="text-[11px] font-mono text-zinc-500 mt-1">{payment.receiptNumber}</p>
            </div>
          </div>

          {/* Details Table */}
          <div className="py-4 space-y-3 text-sm border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-xs">Шогирд (Ученик):</span>
              <span className="font-bold text-sm">{payment.studentName}</span>
            </div>

            {student?.studentCode && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-xs">ID Шогирд:</span>
                <span className="font-mono font-bold text-xs bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
                  {student.studentCode}
                </span>
              </div>
            )}

            {shift && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-xs">Смена ва гурӯҳ:</span>
                <span className="font-medium text-xs text-right">
                  {shift.name} ({shift.daysTextTj})
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-xs">Давраи абонемент:</span>
              <span className="font-medium text-xs">{payment.membershipPeriod}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-xs">{t.paymentMethod}:</span>
              <span className="font-semibold text-xs uppercase bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded">
                {payment.paymentMethod === 'CASH'
                  ? 'Нақд (Cash)'
                  : payment.paymentMethod === 'CARD'
                  ? 'Корти бонкӣ (Card)'
                  : 'Интиқоли бонкӣ (Bank)'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-xs">{t.cashier}:</span>
              <span className="font-medium text-xs">{payment.receivedBy}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-xs">{t.paymentDate}:</span>
              <span className="font-medium text-xs">{payment.paymentDate}</span>
            </div>
          </div>

          {/* Amount Paid Highlight */}
          <div className="pt-4 flex items-baseline justify-between">
            <span className="text-sm font-bold uppercase tracking-wide text-zinc-500">
              МАБЛАҒИ ПАРДОХТ:
            </span>
            <div className="text-right">
              <span className="text-3xl font-black text-red-600 dark:text-red-500">
                {payment.amount.toLocaleString()}
              </span>
              <span className="ml-1.5 text-base font-bold text-zinc-600 dark:text-zinc-400">
                TJS
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-5 pt-3 border-t border-dashed border-zinc-300 dark:border-zinc-800 text-[10px] text-zinc-400 text-center space-y-0.5">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Ташаккур барои боварӣ ва интихоби TM BAYONOV MMA!
            </p>
            <p>{gym?.address || 'ш. Душанбе'}</p>
            <p>Тел: {gym?.phone || '+992 90 000 0001'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Printer className="w-4 h-4" /> {t.btnPrintReceipt}
          </button>
        </div>
      </div>
    </Modal>
  );
};
