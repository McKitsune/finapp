/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FinancialSummary } from '../../types/finance.types';

interface BudgetProgressProps {
  summary: FinancialSummary;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({ summary }) => {
  const {
    spentPercentageInt,
    availablePercentageInt,
    graphicalSpentPercentage,
    isDeficit,
  } = summary;

  return (
    <section
      aria-label="Progreso del presupuesto gastado y disponible"
      className="mb-6 rounded-[26px] bg-white px-6 sm:px-8 py-5 shadow-xs border border-black/[0.04]"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Lado izquierdo: 37% del presupuesto gastado */}
        <div className="flex items-baseline gap-2 shrink-0">
          <span className="text-3xl sm:text-[38px] font-black text-[#16171B] tracking-tight leading-none">
            {spentPercentageInt}%
          </span>
          <span className="text-xs sm:text-sm text-[#6E737B] font-medium">
            del presupuesto gastado
          </span>
        </div>

        {/* Centro: Barra de progreso en forma de cápsula idéntica al mockup */}
        <div className="flex-1 w-full md:mx-4">
          <div
            role="progressbar"
            aria-valuenow={spentPercentageInt}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso del presupuesto"
            className="h-6 sm:h-7 bg-[#E8ECEC] rounded-full p-1 relative w-full overflow-hidden flex items-center"
          >
            <div
              style={{ width: `${graphicalSpentPercentage}%` }}
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isDeficit ? 'bg-red-600' : 'bg-[#18191E]'
              }`}
            />
          </div>
        </div>

        {/* Lado derecho: Separador vertical sutil y 63% disponible */}
        <div className="flex items-center gap-4 shrink-0 justify-between md:justify-start">
          <div
            className="h-8 w-px bg-slate-200 hidden md:block"
            aria-hidden="true"
          />
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl sm:text-[28px] font-black tracking-tight leading-none ${
                isDeficit ? 'text-red-600' : 'text-[#16171B]'
              }`}
            >
              {isDeficit ? '0%' : `${availablePercentageInt}%`}
            </span>
            <span className="text-xs sm:text-sm text-[#6E737B] font-medium">
              disponible
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
