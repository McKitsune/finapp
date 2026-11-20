/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShoppingCart,
  BusFront,
  Zap,
  ShoppingBag,
  Ticket,
  HeartPulse,
  GraduationCap,
  Home,
  Package,
  Briefcase,
  UserCheck,
  Building2,
  Gift,
  RotateCcw,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { FinanceMovement } from '../../types/finance.types';
import { formatCurrencyCOP } from '../../utils/finance.utils';

interface MovementItemProps {
  item: FinanceMovement;
  onSelect?: (item: FinanceMovement) => void;
  showChevron?: boolean;
}

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>
> = {
  Alimentación: ShoppingCart,
  Transporte: BusFront,
  'Servicios públicos': Zap,
  'Ropa y compras personales': ShoppingBag,
  'Entretenimiento y ocio': Ticket,
  Salud: HeartPulse,
  Educación: GraduationCap,
  Hogar: Home,
  Salario: Briefcase,
  'Trabajo independiente': UserCheck,
  Negocio: Building2,
  Bonificación: TrendingUp,
  Regalo: Gift,
  Reembolso: RotateCcw,
  Otros: Package,
};

export const MovementItem: React.FC<MovementItemProps> = ({
  item,
  onSelect,
  showChevron = false,
}) => {
  const isIncome = item.type === 'income';
  const IconComponent = CATEGORY_ICONS[item.category] || (isIncome ? TrendingUp : Package);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect && onSelect(item)}
        className="w-full flex items-center justify-between gap-4 py-3 sm:py-3.5 px-2 -mx-2 rounded-2xl transition-all duration-150 hover:bg-[#F0F2F2] cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-[#E2FE52]"
        aria-label={`Ver detalle de ${item.description || item.category}, ${isIncome ? 'ingreso de ' : 'gasto de '}${formatCurrencyCOP(item.amountCOP)}`}
      >
        {/* Ícono en contenedor cuadrado suave y detalles */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
              isIncome
                ? 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100'
                : 'bg-[#F0F2F2] group-hover:bg-white text-[#16171B]'
            }`}
          >
            <IconComponent className="w-5 h-5 stroke-[2]" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="text-sm sm:text-[15px] font-bold text-[#16171B] truncate">
              {item.description || item.category}
            </p>
            <p className="text-xs text-[#717680] font-normal mt-0.5">
              {item.category !== item.description ? `${item.category} · ` : ''}
              {item.dateFormattedSpanish || item.date}
            </p>
          </div>
        </div>

        {/* Monto formateado con diferenciación visual para ingresos y gastos */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-sm sm:text-[15px] font-bold font-mono tabular-nums ${
              isIncome ? 'text-emerald-700' : 'text-[#16171B]'
            }`}
          >
            {isIncome ? '+' : ''}{formatCurrencyCOP(item.amountCOP)}
          </span>
          {showChevron && (
            <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
          )}
        </div>
      </button>
    </li>
  );
};
