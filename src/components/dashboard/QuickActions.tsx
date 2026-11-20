/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, TrendingUp, TrendingDown, ScanLine } from 'lucide-react';

interface QuickActionsProps {
  onOpenNewIncome: () => void;
  onOpenNewExpense: () => void;
  onOpenReceipt: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenNewIncome,
  onOpenNewExpense,
  onOpenReceipt,
}) => {
  return (
    <section aria-label="Acciones rápidas" className="mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Botón: + Registrar ingreso (Verde suave) */}
        <button
          type="button"
          onClick={onOpenNewIncome}
          className="flex-1 h-12 inline-flex items-center justify-center gap-2.5 px-6 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 font-extrabold text-sm shadow-xs transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-200/60 flex items-center justify-center text-emerald-800">
            <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
          </div>
          <span>+ Registrar ingreso</span>
        </button>

        {/* Botón: + Registrar gasto (Negro con acento amarillo lima) */}
        <button
          type="button"
          onClick={onOpenNewExpense}
          className="flex-1 h-12 inline-flex items-center justify-center gap-2.5 px-6 rounded-2xl bg-[#16171B] hover:bg-black text-[#E2FE52] font-extrabold text-sm shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E2FE52]"
        >
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[#E2FE52]">
            <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
          </div>
          <span>+ Registrar gasto</span>
        </button>
        <button type="button" onClick={onOpenReceipt}
          className="flex-1 h-12 inline-flex items-center justify-center gap-2.5 px-6 rounded-2xl bg-white hover:bg-[#F9FDEA] text-[#16171B] border border-slate-200 font-extrabold text-sm shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-[#E2FE52]">
          <ScanLine className="w-5 h-5" aria-hidden="true" /> <span>Escanear factura</span>
        </button>
      </div>
    </section>
  );
};
