/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { PeriodIdentifier, FinanceMovement } from '../../types/finance.types';

interface MonthSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePeriod: PeriodIdentifier;
  onSelectPeriod: (period: PeriodIdentifier) => void;
  allMovements: FinanceMovement[];
}

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const MonthSelectorModal: React.FC<MonthSelectorModalProps> = ({
  isOpen,
  onClose,
  activePeriod,
  onSelectPeriod,
  allMovements,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(activePeriod.year);

  if (!isOpen) return null;

  // Mapa de meses que contienen movimientos para mostrar indicadores sutiles
  const movementCountsByMonth = new Map<string, number>();
  allMovements.forEach((m) => {
    let key = '';
    if (m.dateISO) {
      key = m.dateISO.slice(0, 7); // 'YYYY-MM'
    } else if (m.date) {
      const parts = m.date.split('/');
      if (parts.length === 3) {
        key = `${parts[2]}-${parts[1].padStart(2, '0')}`;
      }
    }
    if (key) {
      movementCountsByMonth.set(key, (movementCountsByMonth.get(key) || 0) + 1);
    }
  });

  const handleSelectMonth = (monthIndex: number) => {
    const monthNum = monthIndex + 1;
    const key = `${selectedYear}-${monthNum.toString().padStart(2, '0')}`;
    const label = `${MONTH_NAMES[monthIndex]} ${selectedYear}`;

    onSelectPeriod({
      year: selectedYear,
      month: monthNum,
      key,
      label,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="month-selector-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto p-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FE52] flex items-center justify-center text-[#16171B]">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="month-selector-title" className="text-xl font-extrabold text-[#16171B] tracking-tight">
                Seleccionar período
              </h2>
              <p className="text-xs text-slate-500">
                Consulta y gestiona el presupuesto por mes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector"
            className="w-9 h-9 rounded-full bg-[#F0F2F2] hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de año con flechas */}
        <div className="flex items-center justify-between my-4 px-2">
          <button
            type="button"
            onClick={() => setSelectedYear((y) => y - 1)}
            aria-label="Año anterior"
            className="w-9 h-9 rounded-xl bg-[#F0F2F2] hover:bg-slate-200 flex items-center justify-center text-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-lg font-black text-[#16171B] font-mono">
            {selectedYear}
          </span>

          <button
            type="button"
            onClick={() => setSelectedYear((y) => y + 1)}
            aria-label="Año siguiente"
            className="w-9 h-9 rounded-xl bg-[#F0F2F2] hover:bg-slate-200 flex items-center justify-center text-slate-800 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Cuadrícula de 12 meses */}
        <div className="grid grid-cols-3 gap-2.5 py-2">
          {MONTH_NAMES.map((name, idx) => {
            const monthNum = idx + 1;
            const periodKey = `${selectedYear}-${monthNum.toString().padStart(2, '0')}`;
            const isActive =
              activePeriod.year === selectedYear && activePeriod.month === monthNum;
            const movementCount = movementCountsByMonth.get(periodKey) || 0;

            return (
              <button
                key={name}
                type="button"
                onClick={() => handleSelectMonth(idx)}
                className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#16171B] text-[#E2FE52] border-[#16171B] shadow-md scale-[1.02]'
                    : 'bg-[#F8FAFA] hover:bg-[#F0F2F2] border-slate-100 text-slate-800'
                }`}
              >
                <span>{name}</span>
                {movementCount > 0 && (
                  <span
                    className={`mt-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#E2FE52] text-[#16171B]' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {movementCount} {movementCount === 1 ? 'mov.' : 'movs.'}
                  </span>
                )}
                {isActive && (
                  <Check className="w-3.5 h-3.5 text-[#E2FE52] absolute top-1.5 right-1.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Botón para volver al mes base predeterminado */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Período actual: <strong className="text-slate-800">{activePeriod.label}</strong></span>
          <button
            type="button"
            onClick={() => {
              setSelectedYear(2025);
              handleSelectMonth(6); // Julio (índice 6)
            }}
            className="text-slate-800 font-bold underline hover:text-black cursor-pointer"
          >
            Ir a Julio 2025
          </button>
        </div>
      </div>
    </div>
  );
};
