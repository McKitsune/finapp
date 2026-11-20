/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus, Minus, ArrowRightLeft, TrendingUp, Calendar, AlertCircle, Edit2, Trash2, Eye } from 'lucide-react';
import { SavingsPocket, SavingsMovement } from '../../types/pockets.types';
import { calculatePocketSummary } from '../../utils/pockets.utils';
import { formatCurrencyCOP } from '../../utils/finance.utils';

interface PocketCardProps {
  pocket: SavingsPocket;
  movements: SavingsMovement[];
  onDeposit: (pocket: SavingsPocket) => void;
  onWithdraw: (pocket: SavingsPocket) => void;
  onTransfer: (pocket: SavingsPocket) => void;
  onViewDetail: (pocket: SavingsPocket) => void;
  onEdit: (pocket: SavingsPocket) => void;
  onDelete: (pocket: SavingsPocket) => void;
}

export const PocketCard: React.FC<PocketCardProps> = ({
  pocket,
  movements,
  onDeposit,
  onWithdraw,
  onTransfer,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  const summary = calculatePocketSummary(pocket, movements);

  return (
    <article className="rounded-[26px] bg-white p-6 shadow-xs border border-black/[0.04] flex flex-col justify-between transition-all hover:shadow-md group">
      <div>
        {/* Cabecera de la tarjeta */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-inner shrink-0"
              style={{ backgroundColor: pocket.color || '#7666F5' }}
            >
              {pocket.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#16171B] tracking-tight group-hover:text-[#7666F5] transition-colors">
                {pocket.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Meta: {formatCurrencyCOP(pocket.targetAmountCOP)}</span>
              </p>
            </div>
          </div>

          {/* Estado badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${summary.badgeColorClass}`}
          >
            {summary.statusLabel}
          </span>
        </div>

        {/* Métricas financieras del bolsillo */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-[#F8FAFA] rounded-2xl mb-4 border border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Ahorro real
            </span>
            <span className="text-base sm:text-lg font-black text-[#16171B] font-mono tabular-nums">
              {formatCurrencyCOP(summary.currentSavedCOP)}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">
              Faltante
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-700 font-mono tabular-nums">
              {formatCurrencyCOP(summary.remainingCOP)}
            </span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600">Avance total</span>
            <span className="text-[#16171B]">{summary.progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-3.5 w-full bg-[#E8ECEC] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, summary.progressPercentage)}%`,
                backgroundColor: pocket.color || '#7666F5',
              }}
            />
          </div>
        </div>

        {/* Comparativo de plan */}
        <div className="space-y-1 text-xs text-slate-600 mb-5 border-t border-slate-100 pt-3">
          <div className="flex justify-between">
            <span>Ahorro esperado a la fecha:</span>
            <span className="font-bold font-mono text-[#16171B]">
              {formatCurrencyCOP(summary.expectedSavedCOP)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Diferencia frente al plan:</span>
            <span
              className={`font-bold font-mono ${
                summary.differenceCOP >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {summary.differenceCOP >= 0 ? '+' : ''}
              {formatCurrencyCOP(summary.differenceCOP)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Cumplimiento del plan:</span>
            <span className="font-bold text-[#16171B]">
              {summary.compliancePercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Botones de acción rápida y gestión */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDeposit(pocket)}
            className="flex-1 py-2 px-3 rounded-xl bg-[#16171B] hover:bg-black text-[#E2FE52] font-extrabold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Aporte</span>
          </button>
          <button
            type="button"
            onClick={() => onWithdraw(pocket)}
            className="flex-1 py-2 px-3 rounded-xl bg-[#F0F2F2] hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>Retiro</span>
          </button>
          <button
            type="button"
            onClick={() => onTransfer(pocket)}
            className="py-2 px-3 rounded-xl bg-[#F0F2F2] hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Transferir a otro bolsillo"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => onViewDetail(pocket)}
            className="text-xs font-bold text-[#7666F5] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver gráficas y proyecciones</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(pocket)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Editar bolsillo"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(pocket)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              title="Eliminar bolsillo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
