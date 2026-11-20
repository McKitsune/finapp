/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, DollarSign, Calendar, AlertCircle, Wallet } from 'lucide-react';
import { SavingsPocket, NewSavingsMovementFormData } from '../../types/pockets.types';
import { formatCurrencyCOP, getTodayISODate } from '../../utils/finance.utils';

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  pocket: SavingsPocket | null;
  initialType: 'deposit' | 'withdrawal';
  onSave: (data: NewSavingsMovementFormData) => boolean;
}

export const DepositWithdrawModal: React.FC<DepositWithdrawModalProps> = ({
  isOpen,
  onClose,
  pocket,
  initialType,
  onSave,
}) => {
  const [type, setType] = useState<'deposit' | 'withdrawal'>(initialType);
  const [amountRaw, setAmountRaw] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>(getTodayISODate());
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setAmountRaw('');
      setDateStr(getTodayISODate());
      setNotes('');
      setError(null);
    }
  }, [isOpen, initialType]);

  if (!isOpen || !pocket) return null;

  const amountCOP = parseInt(amountRaw.replace(/[^0-9]/g, ''), 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountCOP <= 0) {
      setError('El monto debe ser mayor a cero.');
      return;
    }
    if (type === 'withdrawal' && amountCOP > pocket.targetAmountCOP * 2) {
      // Advertencia opcional o límite razonable
    }

    const saved = onSave({
      pocketId: pocket.id,
      type,
      amountCOP,
      dateStr,
      notes: notes.trim() || undefined,
    });
    if (saved) onClose();
    else setError('No se pudo guardar el movimiento. Revisa el saldo y el almacenamiento.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deposit-withdraw-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-sm ${
                type === 'deposit' ? 'bg-emerald-600' : 'bg-amber-600'
              }`}
            >
              {type === 'deposit' ? <Plus className="w-5 h-5 stroke-[3]" /> : <Minus className="w-5 h-5 stroke-[3]" />}
            </div>
            <div>
              <h2 id="deposit-withdraw-title" className="text-xl font-extrabold text-[#16171B] tracking-tight">
                {type === 'deposit' ? 'Registrar aporte' : 'Registrar retiro'}
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                Bolsillo: <span className="font-bold text-[#16171B]">{pocket.name}</span>
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

          {/* Selector de tipo (Aporte / Retiro) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F0F2F2] rounded-2xl">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                type === 'deposit' ? 'bg-[#16171B] text-[#E2FE52] shadow-xs' : 'text-slate-600 hover:text-black'
              }`}
            >
              + Aporte
            </button>
            <button
              type="button"
              onClick={() => setType('withdrawal')}
              className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                type === 'withdrawal' ? 'bg-[#16171B] text-[#E2FE52] shadow-xs' : 'text-slate-600 hover:text-black'
              }`}
            >
              - Retiro
            </button>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Valor del {type === 'deposit' ? 'aporte' : 'retiro'} (COP) <span className="text-rose-500">*</span>
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
                placeholder="350.000"
                autoFocus
                className="w-full pl-10 pr-16 py-3 rounded-2xl bg-[#F0F2F2] border border-transparent focus:border-[#E2FE52] focus:bg-white text-xl font-extrabold text-[#16171B] focus:outline-none focus:ring-2 focus:ring-[#E2FE52] font-mono tabular-nums"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                COP
              </div>
            </div>
            {amountCOP > 0 && (
              <p className="mt-1 text-xs text-slate-500 font-semibold">
                Monto: <span className="text-[#16171B]">{formatCurrencyCOP(amountCOP)}</span>
              </p>
            )}
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

          {/* Notas */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Notas (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ej. Aporte extra de prima, retiro parcial"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F0F2F2] border border-transparent focus:border-[#E2FE52] focus:bg-white text-xs sm:text-sm font-semibold text-[#16171B] focus:outline-none"
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            * Nota: Los aportes reducen el dinero libre disponible para gastar en tu presupuesto mensual; los retiros lo aumentan. Ninguno se considera gasto ordinario.
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
              className={`px-6 py-2.5 rounded-full font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
                type === 'deposit'
                  ? 'bg-[#16171B] text-[#E2FE52] hover:bg-black'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {type === 'deposit' ? 'Guardar aporte' : 'Guardar retiro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
