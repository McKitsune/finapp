/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { FinanceMovement } from '../../types/finance.types';
import { formatCurrencyCOP } from '../../utils/finance.utils';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  movement: FinanceMovement | null;
  onConfirmDelete: (id: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  movement,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!isOpen || !movement) return null;

  const isIncome = movement.type === 'income';

  const handleConfirm = () => {
    setIsDeleting(true);
    onConfirmDelete(movement.id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h2 id="delete-confirm-title" className="text-lg font-extrabold text-[#16171B] tracking-tight">
              ¿Eliminar {isIncome ? 'este ingreso' : 'este gasto'}?
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar confirmación"
            className="w-8 h-8 rounded-full bg-[#F0F2F2] hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Esta acción eliminará de forma definitiva el siguiente movimiento y recalculará automáticamente los saldos, gráficas y porcentajes del mes:
          </p>

          <div className="p-4 bg-[#F8FAFA] rounded-2xl border border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-[#16171B] truncate">{movement.description}</span>
              <span
                className={`font-mono font-extrabold ${
                  isIncome ? 'text-emerald-700' : 'text-[#16171B]'
                }`}
              >
                {isIncome ? '+' : '-'}
                {formatCurrencyCOP(movement.amountCOP)}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>{movement.category}</span>
              <span>·</span>
              <span>{movement.dateFormattedSpanish || movement.date}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Esta operación no se puede deshacer.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-full border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Eliminando...' : 'Eliminar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
