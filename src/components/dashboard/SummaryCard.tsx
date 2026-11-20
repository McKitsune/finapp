/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CreditCard, ShoppingCart, Coins, Edit2, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import { FinancialSummary } from '../../types/finance.types';
import { formatCurrencyCOP } from '../../utils/finance.utils';

interface SummaryCardProps {
  summary: FinancialSummary;
  onOpenEditBudget: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  summary,
  onOpenEditBudget,
}) => {
  const {
    budgetCOP,
    additionalIncomeCOP,
    totalExpensesCOP,
    availableBalanceCOP,
    isDeficit,
  } = summary;

  const hasConfiguredBudget = budgetCOP > 0;

  // Formateador numérico de miles
  const formatAmount = (num: number) => {
    return Math.abs(Math.round(num))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <section aria-label="Resumen financiero" className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        {/* Tarjeta 1 — Presupuesto mensual (Editable con estado sin configurar) */}
        <article className="rounded-[26px] bg-white p-6 sm:p-7 shadow-xs border border-black/[0.04] flex flex-col justify-between transition-all hover:shadow-md group">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F0F2F2] flex items-center justify-center text-slate-800 shrink-0">
                <CreditCard className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold text-[#16171B]">
                Presupuesto mensual
              </span>
            </div>

            {hasConfiguredBudget && (
              <button
                type="button"
                onClick={onOpenEditBudget}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-800 p-1.5 rounded-xl hover:bg-[#F0F2F2] transition-colors cursor-pointer"
                title="Editar presupuesto mensual"
                aria-label="Editar presupuesto mensual"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="mt-7">
            {hasConfiguredBudget ? (
              <>
                <div className="flex items-baseline flex-wrap">
                  <span className="text-3xl sm:text-[34px] font-extrabold text-[#16171B] tracking-tight font-mono tabular-nums">
                    ${formatAmount(budgetCOP)}
                  </span>
                  <span className="text-base font-semibold text-slate-600 ml-1.5">
                    COP
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Presupuesto base asignado al mes
                </p>
              </>
            ) : (
              /* Estado sin presupuesto configurado */
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  Configura tu presupuesto para comenzar.
                </p>
                <button
                  type="button"
                  onClick={onOpenEditBudget}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#16171B] text-[#E2FE52] hover:bg-black font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Definir presupuesto</span>
                </button>
              </div>
            )}
          </div>
        </article>

        {/* Tarjeta 2 — Total gastado (Destacada en color Lima) */}
        <article className="rounded-[26px] bg-[#E2FE52] p-6 sm:p-7 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-xs shrink-0">
                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold text-[#16171B]">
                Total gastado
              </span>
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-baseline flex-wrap">
              <span className="text-3xl sm:text-[34px] font-extrabold text-[#16171B] tracking-tight font-mono tabular-nums">
                ${formatAmount(totalExpensesCOP)}
              </span>
              <span className="text-base font-semibold text-slate-900 ml-1.5">
                COP
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-800 font-medium">
              {totalExpensesCOP === 0
                ? 'Aún no has registrado gastos este mes.'
                : 'Suma de todos los gastos del período'}
            </p>
          </div>
        </article>

        {/* Tarjeta 3 — Saldo disponible (Con aviso discreto de ingresos adicionales) */}
        <article
          className={`rounded-[26px] bg-white p-6 sm:p-7 shadow-xs border flex flex-col justify-between transition-all hover:shadow-md ${
            isDeficit ? 'border-red-400 bg-red-50/20' : 'border-black/[0.04]'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  isDeficit ? 'bg-red-100 text-red-600' : 'bg-[#F0F2F2] text-slate-800'
                }`}
              >
                {isDeficit ? (
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <Coins className="w-5 h-5" aria-hidden="true" />
                )}
              </div>
              <span className="text-sm font-semibold text-[#16171B]">
                Saldo disponible
              </span>
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-baseline flex-wrap">
              <span
                className={`text-3xl sm:text-[34px] font-extrabold tracking-tight font-mono tabular-nums ${
                  isDeficit ? 'text-red-600' : 'text-[#16171B]'
                }`}
              >
                {isDeficit ? '-' : ''}${formatAmount(availableBalanceCOP)}
              </span>
              <span className="text-base font-semibold text-slate-600 ml-1.5">
                COP
              </span>
            </div>

            {/* Aviso discreto de ingresos adicionales conforme a 7.B */}
            <div className="mt-1 text-[11px] text-slate-500 flex items-center flex-wrap gap-1">
              {additionalIncomeCOP > 0 ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  +{formatCurrencyCOP(additionalIncomeCOP, { showCOP: false })} ingresos adicionales
                </span>
              ) : (
                <span>Sin ingresos adicionales este mes</span>
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
