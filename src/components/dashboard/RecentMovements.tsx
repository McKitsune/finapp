/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, Receipt, Info } from 'lucide-react';
import { FinanceMovement } from '../../types/finance.types';
import { MovementItem } from './MovementItem';
import { EmptyState } from '../common/EmptyState';

interface RecentMovementsProps {
  movements: FinanceMovement[];
  onOpenHistory: () => void;
  onSelectMovement: (item: FinanceMovement) => void;
  onOpenNewExpense?: () => void;
  periodLabel: string;
}

export const RecentMovements: React.FC<RecentMovementsProps> = ({
  movements,
  onOpenHistory,
  onSelectMovement,
  onOpenNewExpense,
  periodLabel,
}) => {
  const recentItems = movements.slice(0, 5);
  const expenseCount = movements.filter((m) => m.type === 'expense').length;
  const incomeCount = movements.filter((m) => m.type === 'income').length;

  return (
    <section
      aria-labelledby="recent-movements-heading"
      className="rounded-[26px] bg-white p-6 sm:p-7 shadow-xs border border-black/[0.04] flex flex-col justify-between min-h-[380px]"
    >
      {/* Encabezado: Ícono de reloj en círculo, título y botón 'Ver todos' */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-[#16171B] shrink-0">
            <Clock className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
          </div>
          <h2
            id="recent-movements-heading"
            className="text-lg sm:text-xl font-extrabold text-[#16171B] tracking-tight"
          >
            Últimos movimientos
          </h2>
        </div>

        {/* Enlace funcional para abrir el historial completo */}
        {movements.length > 0 && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="text-xs sm:text-sm font-bold text-[#16171B] hover:text-slate-600 underline underline-offset-4 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[#E2FE52] rounded-md px-1 py-0.5"
          >
            Ver todos
          </button>
        )}
      </div>

      {/* Condicional de contenido / estados vacíos */}
      {movements.length === 0 ? (
        /* Caso 1: Sin movimientos de ningún tipo en el mes */
        <div className="flex-1 flex items-center justify-center py-4">
          <EmptyState
            variant="card"
            icon={<Receipt className="w-7 h-7 text-slate-500 stroke-[1.8]" />}
            title="Tus gastos van a vivir aquí"
            description="Cada vez que pagues algo, lo registras y aparece en esta lista."
            actionLabel="Registrar gasto"
            onAction={onOpenNewExpense}
          />
        </div>
      ) : (
        /* Caso 2: Existen movimientos en el mes */
        <div className="flex-1 flex flex-col justify-between">
          {/* Aviso contextual discreto si solo hay ingresos y aún ningún gasto */}
          {expenseCount === 0 && incomeCount > 0 && (
            <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2 text-xs text-slate-600">
              <Info className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Aún no tienes gastos este mes. Mostrando tus ingresos registrados.</span>
            </div>
          )}

          <ul role="list" className="divide-y-0 flex flex-col justify-between flex-1">
            {recentItems.map((item) => (
              <MovementItem
                key={item.id}
                item={item}
                onSelect={onSelectMovement}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
