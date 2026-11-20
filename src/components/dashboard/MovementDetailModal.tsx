/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  ArrowLeft,
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
  Calendar,
  FileText,
  CreditCard,
  Edit2,
  Trash2,
  TrendingDown,
  TrendingUp,
  Tag,
  FileSearch,
} from 'lucide-react';
import { FinanceMovement } from '../../types/finance.types';
import { formatCurrencyCOP } from '../../utils/finance.utils';

interface MovementDetailModalProps {
  isOpen?: boolean;
  item: FinanceMovement | null;
  onClose: () => void;
  onBack?: () => void;
  onEdit: (item: FinanceMovement) => void;
  onDelete: (item: FinanceMovement) => void;
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

export const MovementDetailModal: React.FC<MovementDetailModalProps> = ({
  isOpen = false,
  item,
  onClose,
  onBack,
  onEdit,
  onDelete,
}) => {
  // Solo se renderiza si isOpen es true o si existe un item
  const shouldRender = isOpen || Boolean(item);
  if (!shouldRender) return null;

  // Estado vacío: se abrió el modal pero no hay ningún movimiento seleccionado
  if (!item) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="empty-detail-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      >
        <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto p-6 text-center">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-8 h-8 rounded-full bg-[#F0F2F2] hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-[#F0F2F2] flex items-center justify-center text-slate-500 mx-auto mt-2 mb-3">
            <FileSearch className="w-7 h-7" />
          </div>

          <h3 id="empty-detail-title" className="text-base font-extrabold text-[#16171B]">
            Detalle del movimiento
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            Selecciona un gasto en Movimientos para ver el detalle.
          </p>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-[#16171B] text-white hover:bg-black font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isIncome = item.type === 'income';
  const IconComponent = CATEGORY_ICONS[item.category] || (isIncome ? TrendingUp : ShoppingBag);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Volver a la lista"
                className="w-9 h-9 rounded-full bg-[#F0F2F2] hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors mr-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 id="detail-modal-title" className="text-xl font-extrabold text-[#16171B] tracking-tight">
              Detalle del {isIncome ? 'ingreso' : 'gasto'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="w-9 h-9 rounded-full bg-[#F0F2F2] hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido del detalle */}
        <div className="px-6 py-6 space-y-5">
          {/* Tarjeta de Importe y Categoría */}
          <div
            className={`rounded-[24px] p-5 flex flex-col items-center text-center ${
              isIncome ? 'bg-emerald-50' : 'bg-[#F0F2F2]'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl shadow-xs flex items-center justify-center mb-3 ${
                isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-[#16171B]'
              }`}
            >
              <IconComponent className="w-7 h-7 stroke-[2.2]" aria-hidden="true" />
            </div>

            <span
              className={`text-3xl font-extrabold tracking-tight font-mono tabular-nums ${
                isIncome ? 'text-emerald-800' : 'text-[#16171B]'
              }`}
            >
              {isIncome ? '+' : '-'}
              {formatCurrencyCOP(item.amountCOP)}
            </span>

            <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white/90 px-3 py-1 rounded-full shadow-2xs">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              {item.category}
            </span>
          </div>

          {/* Información estructurada */}
          <div className="space-y-3.5 text-xs sm:text-sm">
            {/* Tipo */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Tipo de movimiento</span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  isIncome ? 'text-emerald-700' : 'text-slate-900'
                }`}
              >
                {isIncome ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>Ingreso adicional</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                    <span>Gasto registrado</span>
                  </>
                )}
              </span>
            </div>

            {/* Descripción */}
            <div className="flex items-start justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Descripción</span>
              <span className="font-bold text-[#16171B] text-right max-w-[60%]">
                {item.description}
              </span>
            </div>

            {/* Fecha */}
            <div className="flex items-start justify-between py-2 border-b border-slate-100">
              <span className="font-semibold text-slate-500">Fecha</span>
              <span className="font-bold text-[#16171B] flex items-center gap-1 text-right">
                <Calendar className="w-4 h-4 text-slate-400" />
                {item.dateFormattedSpanish || item.date}
              </span>
            </div>

            {/* Medio de recepción si es ingreso */}
            {isIncome && item.paymentMethod && (
              <div className="flex items-start justify-between py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-500">Medio de recepción</span>
                <span className="font-bold text-[#16171B] flex items-center gap-1 text-right">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  {item.paymentMethod}
                </span>
              </div>
            )}

            {/* Observaciones */}
            <div className="py-2">
              <span className="font-semibold text-slate-500 block mb-1">
                Observaciones
              </span>
              {item.notes ? (
                <div className="p-3 bg-[#F8FAFA] rounded-xl border border-slate-100 text-xs text-slate-700 font-medium whitespace-pre-wrap flex items-start gap-2">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{item.notes}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Sin observaciones registradas para este movimiento.
                </span>
              )}
            </div>
          </div>

          {/* Botones de acción: Volver, Editar y Eliminar */}
          <div className="pt-2 flex items-center justify-between gap-2.5 border-t border-slate-100">
            {/* Botón Volver */}
            <button
              type="button"
              onClick={onBack || onClose}
              className="px-4 py-2.5 rounded-full border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer text-center"
            >
              Volver
            </button>

            {/* Botón Editar funcional */}
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#16171B] text-[#E2FE52] hover:bg-black font-extrabold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            {/* Botón Eliminar funcional */}
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/60 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              title="Eliminar este movimiento"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
