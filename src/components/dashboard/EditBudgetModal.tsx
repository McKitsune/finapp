/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, DollarSign, AlertCircle, Wallet } from 'lucide-react';
import { formatCurrencyCOP } from '../../utils/finance.utils';

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudgetCOP: number;
  periodLabel: string;
  onSaveBudget: (newBudgetCOP: number) => void;
}

export const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  isOpen,
  onClose,
  currentBudgetCOP,
  periodLabel,
  onSaveBudget,
}) => {
  const [rawAmount, setRawAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setRawAmount(currentBudgetCOP.toString());
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, currentBudgetCOP]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setRawAmount(val);
    if (error) setError(null);
  };

  const parsedAmount = parseInt(rawAmount, 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!rawAmount || parsedAmount <= 0) {
      setError('El presupuesto debe ser mayor que cero ($0 COP).');
      return;
    }

    if (parsedAmount > 1000000000) {
      setError('El monto excede el límite permitido para el presupuesto mensual.');
      return;
    }

    setIsSubmitting(true);
    onSaveBudget(parsedAmount);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-budget-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FE52] flex items-center justify-center text-[#16171B]">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="edit-budget-title" className="text-xl font-extrabold text-[#16171B] tracking-tight">
                Editar presupuesto
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Período: <span className="font-bold text-[#16171B]">{periodLabel}</span>
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="p-3.5 bg-[#F8FAFA] rounded-2xl border border-slate-100">
            <span className="text-xs text-slate-500 font-medium block">
              Presupuesto actual configurado:
            </span>
            <span className="text-lg font-bold text-[#16171B] font-mono tabular-nums">
              {formatCurrencyCOP(currentBudgetCOP)}
            </span>
          </div>

          {/* Campo: Nuevo presupuesto */}
          <div>
            <label htmlFor="new-budget-input" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Nuevo presupuesto mensual (COP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <input
                id="new-budget-input"
                type="text"
                inputMode="numeric"
                value={rawAmount}
                onChange={handleAmountChange}
                placeholder="0"
                autoFocus
                className={`w-full pl-10 pr-20 py-3 rounded-2xl bg-[#F0F2F2] border text-lg sm:text-xl font-extrabold text-[#16171B] focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  error ? 'border-red-500 focus:ring-red-400' : 'border-transparent focus:ring-[#E2FE52]'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs sm:text-sm font-bold text-slate-500">
                COP
              </div>
            </div>

            {parsedAmount > 0 && (
              <p className="mt-1 text-xs font-semibold text-slate-600">
                Nuevo monto: <span className="text-[#16171B]">{formatCurrencyCOP(parsedAmount)}</span>
              </p>
            )}

            {error && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Este cambio afectará únicamente al mes seleccionado (<span className="font-semibold text-slate-700">{periodLabel}</span>).
            Los movimientos y gastos ya registrados se conservarán intactos.
          </p>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-full bg-[#16171B] text-[#E2FE52] hover:bg-black font-extrabold text-xs sm:text-sm shadow-md transition-all duration-150 cursor-pointer ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
