/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DashboardHeaderProps {
  periodLabel: string;
  onOpenMonthSelector: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  periodLabel,
  onOpenMonthSelector,
}) => {
  return (
    <header className="mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Título principal con resaltador lima en 'Mensual' y subtítulo */}
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold tracking-tight text-[#16171B] leading-tight flex items-center flex-wrap gap-2">
            <span>FINAPP</span>
            <span className="bg-[#E2FE52] text-[#16171B] px-3.5 py-0.5 rounded-full inline-block font-extrabold">
              Mensual
            </span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#6E737B] font-normal">
            Mi app para el control y ahorro de gastos.
          </p>
        </div>

        {/* Selector de mes y año (Interactivo y funcional) */}
        <div className="self-start sm:self-auto">
          <button
            type="button"
            onClick={onOpenMonthSelector}
            aria-label={`Cambiar período actual: ${periodLabel}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200/90 text-xs sm:text-sm font-semibold text-[#16171B] shadow-xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E2FE52]"
          >
            <Calendar className="w-4 h-4 text-slate-700" aria-hidden="true" />
            <span>{periodLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-0.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
};
