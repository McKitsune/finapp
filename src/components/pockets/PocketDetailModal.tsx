/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, BarChart3, TrendingUp, Calendar, Clock, DollarSign, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { SavingsPocket, SavingsMovement } from '../../types/pockets.types';
import { calculatePocketSummary, calculatePocketChartData } from '../../utils/pockets.utils';
import { formatCurrencyCOP } from '../../utils/finance.utils';

interface PocketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pocket: SavingsPocket | null;
  movements: SavingsMovement[];
  onDeleteMovement: (movementId: string) => void;
}

export const PocketDetailModal: React.FC<PocketDetailModalProps> = ({
  isOpen,
  onClose,
  pocket,
  movements,
  onDeleteMovement,
}) => {
  if (!isOpen || !pocket) return null;

  const summary = calculatePocketSummary(pocket, movements);
  const { barChartData, lineChartData } = calculatePocketChartData(pocket, movements);
  const pocketMoves = movements.filter((m) => m.pocketId === pocket.id).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pocket-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-inner shrink-0"
              style={{ backgroundColor: pocket.color || '#7666F5' }}
            >
              {pocket.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 id="pocket-detail-title" className="text-xl font-extrabold text-[#16171B] tracking-tight">
                {pocket.name} — Detalle y Gráficas
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Meta total: <span className="font-bold text-[#16171B]">{formatCurrencyCOP(pocket.targetAmountCOP)}</span> | Frecuencia: <span className="capitalize">{pocket.frequency}</span>
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

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Tarjetas resumen analíticas */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#F8FAFA] rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-500 font-semibold block">Ahorro Real Acumulado</span>
              <span className="text-xl font-black text-[#16171B] font-mono tabular-nums mt-1 block">
                {formatCurrencyCOP(summary.currentSavedCOP)}
              </span>
            </div>
            <div className="p-4 bg-[#F8FAFA] rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-500 font-semibold block">Ahorro Esperado</span>
              <span className="text-xl font-black text-[#16171B] font-mono tabular-nums mt-1 block">
                {formatCurrencyCOP(summary.expectedSavedCOP)}
              </span>
            </div>
            <div className="p-4 bg-[#F8FAFA] rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-500 font-semibold block">Diferencia vs Plan</span>
              <span className={`text-xl font-black font-mono tabular-nums mt-1 block ${summary.differenceCOP >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {summary.differenceCOP >= 0 ? '+' : ''}{formatCurrencyCOP(summary.differenceCOP)}
              </span>
            </div>
            <div className="p-4 bg-[#F8FAFA] rounded-2xl border border-slate-100">
              <span className="text-xs text-slate-500 font-semibold block">Cumplimiento</span>
              <span className="text-xl font-black text-[#16171B] font-mono tabular-nums mt-1 block">
                {summary.compliancePercentage}%
              </span>
            </div>
          </div>

          {/* Sección 6: Proyección de cumplimiento */}
          <div className="p-5 bg-[#16171B] text-white rounded-[26px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <span className="text-xs text-[#E2FE52] font-extrabold uppercase tracking-wider">
                Proyección de cumplimiento de meta
              </span>
              <p className="text-sm font-semibold text-slate-200">
                Faltan <span className="font-extrabold text-white">{formatCurrencyCOP(summary.remainingCOP)}</span> distribuidos en <span className="font-extrabold text-white">{summary.remainingPeriods} períodos</span> restantes.
              </p>
              {summary.estimatedCompletionDateStr && (
                <p className="text-xs text-slate-400">
                  Fecha estimada de cumplimiento al ritmo actual: <span className="font-bold text-[#E2FE52]">{summary.estimatedCompletionDateStr}</span>
                </p>
              )}
            </div>
            <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/10 shrink-0 text-right">
              <span className="text-[11px] text-slate-400 block font-medium">Aporte necesario por período</span>
              <span className="text-xl font-black text-[#E2FE52] font-mono tabular-nums">
                {formatCurrencyCOP(summary.requiredPeriodicAmountCOP)}
              </span>
            </div>
          </div>

          {/* Sección 4: Gráficas comparativas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfica de barras agrupadas */}
            <div className="p-5 bg-white rounded-[26px] border border-slate-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#16171B] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#7666F5]" />
                  <span>Objetivo vs. Real por período</span>
                </h3>
              </div>

              {barChartData.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Aún no hay suficientes aportes registrados para graficar por período.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {barChartData.map((bar, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{bar.periodLabel}</span>
                        <span className="font-mono">
                          Real: {formatCurrencyCOP(bar.realAmount)} / Plan: {formatCurrencyCOP(bar.targetAmount)}
                        </span>
                      </div>
                      <div className="h-6 bg-[#F0F2F2] rounded-xl overflow-hidden flex">
                        <div
                          className="h-full bg-[#16171B] flex items-center justify-end pr-2 text-[10px] text-[#E2FE52] font-bold"
                          style={{
                            width: `${Math.min(100, (bar.realAmount / Math.max(bar.targetAmount, bar.realAmount, 1)) * 100)}%`,
                          }}
                          title={`Real: ${formatCurrencyCOP(bar.realAmount)}`}
                        >
                          {formatCurrencyCOP(bar.realAmount)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gráfica de progreso acumulado */}
            <div className="p-5 bg-white rounded-[26px] border border-slate-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#16171B] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Evolución de Ahorro Acumulado</span>
                </h3>
              </div>

              {lineChartData.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Sin datos de evolución temporal.
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {lineChartData.map((pt, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                      <span className="font-semibold text-slate-600">{pt.dateLabel}</span>
                      <div className="flex items-center gap-4 font-mono font-bold">
                        <span className="text-slate-500">Esperado: {formatCurrencyCOP(pt.expectedAccumulated)}</span>
                        <span className="text-[#16171B]">Real: {formatCurrencyCOP(pt.realAccumulated)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Historial de movimientos del bolsillo */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-extrabold text-[#16171B]">
              Historial de aportes y retiros ({pocketMoves.length})
            </h3>

            {pocketMoves.length === 0 ? (
              <div className="p-8 text-center bg-[#F8FAFA] rounded-2xl border border-slate-100 text-xs text-slate-500">
                No hay movimientos registrados en este bolsillo todavía.
              </div>
            ) : (
              <div className="space-y-2">
                {pocketMoves.map((m) => {
                  const isDeposit = m.type === 'deposit' || m.type === 'transfer_in';
                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3.5 bg-[#F8FAFA] hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isDeposit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isDeposit ? '+' : '-'}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-extrabold text-[#16171B]">
                            {m.notes || (isDeposit ? 'Aporte a bolsillo' : 'Retiro de bolsillo')}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {m.dateFormattedSpanish || m.date} • <span className="capitalize">{m.type.replace('_', ' ')}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`text-sm sm:text-base font-extrabold font-mono tabular-nums ${isDeposit ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isDeposit ? '+' : '-'}{formatCurrencyCOP(m.amountCOP)}
                        </span>
                        <button
                          type="button"
                          onClick={() => onDeleteMovement(m.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar movimiento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pie */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#16171B] text-white hover:bg-black font-extrabold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Cerrar detalle
          </button>
        </div>
      </div>
    </div>
  );
};
