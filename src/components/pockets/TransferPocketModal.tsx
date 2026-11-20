/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, DollarSign, AlertCircle } from 'lucide-react';
import { SavingsPocket, TransferPocketFormData } from '../../types/pockets.types';
import { formatCurrencyCOP, getTodayISODate } from '../../utils/finance.utils';
import { calculatePocketCurrentSaved } from '../../utils/pockets.utils';

interface TransferPocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePocket: SavingsPocket | null;
  allPockets: SavingsPocket[];
  allMovements: any[];
  onTransfer: (data: TransferPocketFormData) => boolean;
}

export const TransferPocketModal: React.FC<TransferPocketModalProps> = ({
  isOpen,
  onClose,
  sourcePocket,
  allPockets,
  allMovements,
  onTransfer,
}) => {
  const [targetPocketId, setTargetPocketId] = useState<string>('');
  const [amountRaw, setAmountRaw] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>(getTodayISODate());
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && sourcePocket) {
      const otherPockets = allPockets.filter((p) => p.id !== sourcePocket.id);
      setTargetPocketId(otherPockets[0]?.id || '');
      setAmountRaw('');
      setDateStr(getTodayISODate());
      setNotes('');
      setError(null);
    }
  }, [isOpen, sourcePocket, allPockets]);

  if (!isOpen || !sourcePocket) return null;

  const availableSourceBalance = calculatePocketCurrentSaved(sourcePocket.id, allMovements);
  const amountCOP = parseInt(amountRaw.replace(/[^0-9]/g, ''), 10) || 0;
  const otherPockets = allPockets.filter((p) => p.id !== sourcePocket.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPocketId) {
      setError('Selecciona un bolsillo de destino.');
      return;
    }
    if (amountCOP <= 0) {
      setError('El monto a transferir debe ser mayor a cero.');
      return;
    }
    if (amountCOP > availableSourceBalance) {
      setError(`El monto excede el saldo disponible en "${sourcePocket.name}" (${formatCurrencyCOP(availableSourceBalance)}).`);
      return;
    }

    const saved = onTransfer({
      sourcePocketId: sourcePocket.id,
      targetPocketId,
      amountCOP,
      dateStr,
      notes: notes.trim() || undefined,
    });
    if (saved) onClose();
    else setError('No se pudo completar la transferencia. Verifica el saldo y los datos.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-pocket-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7666F5] flex items-center justify-center text-white">
              <ArrowRightLeft className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="transfer-pocket-title" className="text-xl font-extrabold text-[#16171B] tracking-tight">
                Transferir entre bolsillos
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Origen: <span className="font-bold text-[#16171B]">{sourcePocket.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-9 h-9 rounded-full bg-[#F0F2F2] hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-[#F8FAFA] rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500 block">Saldo disponible para transferir:</span>
            <span className="text-base font-extrabold text-[#16171B] font-mono tabular-nums">
              {formatCurrencyCOP(availableSourceBalance)}
            </span>
          </div>

          {/* Bolsillo destino */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Bolsillo de destino <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetPocketId}
              onChange={(e) => setTargetPocketId(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-[#F0F2F2] border border-transparent focus:border-[#E2FE52] focus:bg-white text-sm font-semibold text-[#16171B] focus:outline-none cursor-pointer"
              required
            >
              <option value="" disabled>Selecciona un bolsillo</option>
              {otherPockets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Meta: {formatCurrencyCOP(p.targetAmountCOP)})
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Monto a transferir (COP) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={amountRaw}
                onChange={(e) => setAmountRaw(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="200.000"
                className="w-full pl-10 pr-16 py-3 rounded-2xl bg-[#F0F2F2] border border-transparent focus:border-[#E2FE52] focus:bg-white text-xl font-extrabold text-[#16171B] focus:outline-none focus:ring-2 focus:ring-[#E2FE52] font-mono tabular-nums"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                COP
              </div>
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Fecha <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl bg-[#F0F2F2] border border-transparent focus:border-[#E2FE52] focus:bg-white text-sm font-semibold text-[#16171B] focus:outline-none"
              required
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            * Nota: Una transferencia entre bolsillos redistribuye el dinero reservado virtualmente y no modifica tu saldo libre para gastar ni afecta tus gastos reales.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#16171B] text-[#E2FE52] hover:bg-black font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Transferir fondos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
