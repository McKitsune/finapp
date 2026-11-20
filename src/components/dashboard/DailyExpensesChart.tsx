/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, BarChart2, Info, Receipt } from 'lucide-react';
import { DailyChartBar } from '../../types/finance.types';
import { formatCurrencyCOP } from '../../utils/finance.utils';
import { EmptyState } from '../common/EmptyState';

interface DailyExpensesChartProps {
  periodLabel: string;
  bars: DailyChartBar[];
  onOpenMonthSelector?: () => void;
  onOpenNewExpense?: () => void;
}

export const DailyExpensesChart: React.FC<DailyExpensesChartProps> = ({
  periodLabel,
  bars,
  onOpenMonthSelector,
  onOpenNewExpense,
}) => {
  // Verificamos si existen gastos reales registrados en el período
  const hasExpenses = bars.some((b) => b.totalAmountCOP > 0);

  // Inicialmente seleccionamos el día 14 o el primer día con gastos
  const [selectedDayId, setSelectedDayId] = useState<string>(() => {
    const day14 = bars.find((b) => b.dayId === 'day-14' && b.totalAmountCOP > 0);
    if (day14) return 'day-14';
    const firstWithExpense = bars.find((b) => b.totalAmountCOP > 0);
    return firstWithExpense ? firstWithExpense.dayId : (bars[0]?.dayId || 'day-1');
  });

  // Escala máxima del eje Y: Dinámica con mínimo de 300.000 COP
  const highestExpense = Math.max(0, ...bars.map((b) => b.totalAmountCOP));
  const maxVal = highestExpense > 300000 ? Math.ceil(highestExpense / 50000) * 50000 : 300000;

  // Marcas de referencia para el eje Y
  const yAxisTicks = [
    maxVal,
    Math.round(maxVal * 0.916),
    Math.round(maxVal * 0.833),
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.666),
    Math.round(maxVal * 0.583),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.416),
    Math.round(maxVal * 0.333),
    Math.round(maxVal * 0.25),
    Math.round(maxVal * 0.166),
    Math.round(maxVal * 0.083),
    0,
  ];

  const formatTickLabel = (val: number) => {
    if (val === 0) return '0';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const selectedBar = bars.find((b) => b.dayId === selectedDayId) || bars[0];

  return (
    <section
      aria-labelledby="chart-heading"
      className="rounded-[26px] bg-white p-6 sm:p-7 shadow-xs border border-black/[0.04] flex flex-col justify-between min-h-[380px]"
    >
      {/* Encabezado: Título y selector de período */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F0F2F2] flex items-center justify-center text-slate-800 shrink-0">
            <BarChart2 className="w-4 h-4" aria-hidden="true" />
          </div>
          <h2
            id="chart-heading"
            className="text-lg sm:text-xl font-extrabold text-[#16171B] tracking-tight"
          >
            Comportamiento de gastos
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenMonthSelector}
          aria-label={`Cambiar período del gráfico: ${periodLabel}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/90 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
        >
          <span>{periodLabel}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* Condicional: Si NO hay gastos en el mes seleccionado, mostrar Estado Vacío */}
      {!hasExpenses ? (
        <div className="flex-1 flex items-center justify-center py-6">
          <EmptyState
            variant="chart"
            icon={
              <div className="relative">
                <BarChart2 className="w-8 h-8 text-slate-400 stroke-[1.8]" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#E2FE52] flex items-center justify-center text-[#16171B] text-[10px] font-black">
                  0
                </span>
              </div>
            }
            title="Aún no hay gastos este mes"
            description="Registra el primero y empieza a ver en qué se va la plata."
            actionLabel="Registrar tu primer gasto"
            onAction={onOpenNewExpense}
          />
        </div>
      ) : (
        <>
          {/* Franja de detalle accesible del día activo */}
          <div
            aria-live="polite"
            className="mb-3 px-3.5 py-2 rounded-xl bg-[#F8FAFA] border border-slate-100 flex items-center justify-between text-xs text-slate-600"
          >
            {selectedBar ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[#16171B]">{selectedBar.fullDateLabel}:</span>
                <span className="font-mono font-extrabold text-[#16171B]">
                  {formatCurrencyCOP(selectedBar.totalAmountCOP)}
                </span>
                {selectedBar.expenseCount > 0 && (
                  <span className="text-slate-400">
                    ({selectedBar.expenseCount} {selectedBar.expenseCount === 1 ? 'gasto registrado' : 'gastos sumados'})
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Info className="w-3.5 h-3.5" />
                <span>Pasa el cursor sobre una barra para ver el total del día.</span>
              </div>
            )}
          </div>

          {/* Gráfico principal con barras reales */}
          <div className="relative pt-6 pb-2 overflow-x-auto sm:overflow-x-visible no-scrollbar">
            <div className="min-w-[460px] sm:min-w-0">
              <div className="flex">
                {/* Eje Y con etiquetas monetarias */}
                <div
                  className="flex flex-col justify-between text-right pr-3 select-none text-[10px] sm:text-[11px] text-slate-400 font-medium w-14 shrink-0 h-64"
                  aria-hidden="true"
                >
                  {yAxisTicks.map((tick, index) => (
                    <div key={`tick-${index}-${tick}`} className="leading-none flex items-center justify-end">
                      {formatTickLabel(tick)}
                    </div>
                  ))}
                </div>

                {/* Espacio con líneas horizontales y barras */}
                <div className="relative flex-1 h-64 flex items-end ml-1">
                  {/* Líneas guía horizontales */}
                  <div
                    className="absolute inset-0 flex flex-col justify-between pointer-events-none"
                    aria-hidden="true"
                  >
                    {yAxisTicks.map((tick, index) => (
                      <div
                        key={`grid-line-${index}-${tick}`}
                        className="w-full border-b border-slate-100"
                      />
                    ))}
                  </div>

                  {/* Contenedor de barras */}
                  <div className="relative z-10 w-full h-full flex items-end justify-around px-2 sm:px-4">
                    {bars.map((bar) => {
                      const isSelected = selectedDayId === bar.dayId;
                      const totalHeightPercent =
                        maxVal > 0 ? (bar.totalAmountCOP / maxVal) * 100 : 0;
                      const hasExpense = bar.totalAmountCOP > 0;

                      return (
                        <div
                          key={bar.dayId}
                          className="relative flex flex-col items-center h-full justify-end group"
                        >
                          {/* Tooltip tipo pastilla color Lima para el día seleccionado */}
                          {isSelected && hasExpense && (
                            <div
                              className="absolute z-20 transition-all duration-200"
                              style={{
                                bottom: `${Math.min(94, totalHeightPercent + 4)}%`,
                                top: 'auto',
                              }}
                            >
                              <div className="bg-[#E2FE52] text-[#16171B] text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap animate-in fade-in zoom-in-95">
                                {formatCurrencyCOP(bar.totalAmountCOP, { showCOP: false })}
                              </div>
                            </div>
                          )}

                          {/* Botón interactivo de la barra con soporte de teclado */}
                          <button
                            type="button"
                            onClick={() => setSelectedDayId(bar.dayId)}
                            onMouseEnter={() => setSelectedDayId(bar.dayId)}
                            onFocus={() => setSelectedDayId(bar.dayId)}
                            aria-label={`${bar.fullDateLabel}: ${formatCurrencyCOP(bar.totalAmountCOP)}`}
                            className="cursor-pointer focus:outline-none flex flex-col items-center justify-end h-full px-1"
                          >
                            {hasExpense ? (
                              /* Cápsula de dos tonos */
                              <div
                                style={{ height: `${Math.max(totalHeightPercent, 6)}%` }}
                                className={`w-7 sm:w-9 rounded-full overflow-hidden flex flex-col justify-end transition-all duration-200 shadow-xs ${
                                  isSelected
                                    ? 'ring-2 ring-[#16171B] scale-[1.03]'
                                    : 'hover:scale-[1.02]'
                                }`}
                              >
                                {/* Segmento superior (carbón con punto blanco) */}
                                <div
                                  style={{ height: '52%' }}
                                  className="w-full bg-[#1E1F24] flex items-center justify-center relative min-h-[14px]"
                                >
                                  <span
                                    className="w-2.5 h-2.5 rounded-full bg-white block shadow-xs"
                                    aria-hidden="true"
                                  />
                                </div>

                                {/* Segmento inferior (lima con punto negro) */}
                                <div
                                  style={{ height: '48%' }}
                                  className="w-full bg-[#E2FE52] flex items-center justify-center relative min-h-[14px]"
                                >
                                  <span
                                    className="w-2.5 h-2.5 rounded-full bg-[#16171B] block"
                                    aria-hidden="true"
                                  />
                                </div>
                              </div>
                            ) : (
                              /* Día sin gastos: indicador discreto de base */
                              <div
                                className={`w-7 sm:w-8 h-1.5 rounded-full transition-colors ${
                                  isSelected ? 'bg-slate-500 ring-1 ring-slate-600' : 'bg-slate-200'
                                }`}
                                title="Sin gastos"
                              />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Eje X: Etiquetas de los días */}
              <div className="flex pt-3 pl-15" aria-hidden="true">
                <div className="w-full flex items-center justify-around px-2 sm:px-4">
                  {bars.map((bar) => {
                    const isSelected = selectedDayId === bar.dayId;
                    return (
                      <button
                        key={`label-${bar.dayId}`}
                        type="button"
                        onClick={() => setSelectedDayId(bar.dayId)}
                        className={`text-xs transition-colors cursor-pointer text-center ${
                          isSelected
                            ? 'font-bold text-[#16171B]'
                            : 'font-medium text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {bar.dayLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
