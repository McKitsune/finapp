/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  BusFront,
  Zap,
  ShoppingBag,
  Ticket,
  HeartPulse,
  GraduationCap,
  Home,
  Package,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  Info,
} from 'lucide-react';
import { ExpenseCategory, NewExpenseFormData } from '../../types/finance.types';
import {
  formatCurrencyCOP,
  getTodayISODate,
  getPeriodFromDate,
} from '../../utils/finance.utils';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (formData: NewExpenseFormData) => void;
  defaultDateISO?: string;
  activePeriodKey?: string;
}

const CATEGORIES: {
  label: ExpenseCategory;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: 'Alimentación', icon: ShoppingCart },
  { label: 'Transporte', icon: BusFront },
  { label: 'Servicios públicos', icon: Zap },
  { label: 'Ropa y compras personales', icon: ShoppingBag },
  { label: 'Entretenimiento y ocio', icon: Ticket },
  { label: 'Salud', icon: HeartPulse },
  { label: 'Educación', icon: GraduationCap },
  { label: 'Hogar', icon: Home },
  { label: 'Otros', icon: Package },
];

export const NewExpenseModal: React.FC<NewExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  defaultDateISO,
  activePeriodKey,
}) => {
  const [rawAmount, setRawAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Alimentación');
  const [dateStr, setDateStr] = useState<string>(defaultDateISO || getTodayISODate());
  const [notes, setNotes] = useState<string>('');

  const [errors, setErrors] = useState<{
    amount?: string;
    description?: string;
    date?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setRawAmount('');
      setDescription('');
      setCategory('Alimentación');
      setDateStr(defaultDateISO || getTodayISODate());
      setNotes('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, defaultDateISO]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setRawAmount(val);
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const parsedAmount = parseInt(rawAmount, 10) || 0;

  // Verificamos si la fecha elegida difiere del mes activo actual
  const chosenPeriod = getPeriodFromDate(dateStr);
  const isDifferentPeriod = activePeriodKey && chosenPeriod.key !== activePeriodKey;

  const validate = (): boolean => {
    const newErrors: { amount?: string; description?: string; date?: string } = {};

    if (!rawAmount || parsedAmount <= 0) {
      newErrors.amount = 'El valor del gasto debe ser mayor que cero ($0 COP).';
    } else if (parsedAmount > 1000000000) {
      newErrors.amount = 'El monto excede el límite permitido para este registro.';
    }

    if (!description.trim()) {
      newErrors.description = 'Ingresa una descripción del gasto (ej: Mercado, Almuerzo).';
    }

    if (!dateStr) {
      newErrors.date = 'Selecciona una fecha válida.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    onSaveExpense({
      amountCOP: parsedAmount,
      description: description.trim(),
      category,
      dateStr,
      notes: notes.trim() ? notes.trim() : undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cabecera del formulario */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 id="modal-title" className="text-xl sm:text-2xl font-extrabold text-[#16171B] tracking-tight">
              Registrar nuevo gasto
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Completa los datos del gasto para actualizar tu presupuesto.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="w-10 h-10 rounded-full bg-[#F0F2F2] hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aviso de período diferente */}
        {isDifferentPeriod && (
          <div className="mx-6 sm:mx-8 mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 shrink-0">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Nota de fecha:</strong> Este gasto corresponde a{' '}
              <strong>{chosenPeriod.label}</strong>. Se registrará en ese período y podrás consultarlo cambiando el mes en el selector.
            </span>
          </div>
        )}

        {/* Formulario con scroll interno */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Campo: Valor del gasto */}
          <div>
            <label htmlFor="expense-amount" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Valor del gasto (COP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <DollarSign className="w-5 h-5 text-slate-400" />
              </div>
              <input
                id="expense-amount"
                type="text"
                inputMode="numeric"
                value={rawAmount}
                onChange={handleAmountChange}
                placeholder="0"
                autoFocus
                className={`w-full pl-10 pr-20 py-3 rounded-2xl bg-[#F0F2F2] border text-lg sm:text-xl font-extrabold text-[#16171B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.amount
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-transparent focus:ring-[#E2FE52]'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs sm:text-sm font-bold text-slate-500">
                COP
              </div>
            </div>

            {/* Vista previa formateada */}
            {parsedAmount > 0 && (
              <p className="mt-1 text-xs font-semibold text-slate-600">
                Monto registrado: <span className="text-slate-900 font-bold">{formatCurrencyCOP(parsedAmount)}</span>
              </p>
            )}

            {errors.amount && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Campo: Descripción */}
          <div>
            <label htmlFor="expense-desc" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Descripción <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <input
                id="expense-desc"
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                placeholder="Ej: Mercado semanal, Almuerzo, Transporte"
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0F2F2] border text-sm font-medium text-[#16171B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.description
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-transparent focus:ring-[#E2FE52]'
                }`}
              />
            </div>
            {errors.description && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Campo: Categoría (Todas las 9 categorías iniciales) */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Categoría <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E2FE52] border-[#16171B] text-[#16171B] shadow-xs scale-[1.02]'
                        : 'bg-[#F0F2F2] border-transparent text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 stroke-[2.2]" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campo: Fecha */}
          <div>
            <label htmlFor="expense-date" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Fecha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Calendar className="w-4 h-4 text-slate-400" />
              </div>
              <input
                id="expense-date"
                type="date"
                value={dateStr}
                onChange={(e) => {
                  setDateStr(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0F2F2] border text-sm font-medium text-[#16171B] focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.date
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-transparent focus:ring-[#E2FE52]'
                }`}
              />
            </div>
            {errors.date && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Campo: Observaciones (Opcional) */}
          <div>
            <label htmlFor="expense-notes" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Observaciones <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              id="expense-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales, método de pago, comercio o notas..."
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F0F2F2] border border-transparent text-sm font-medium text-[#16171B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E2FE52] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-full bg-[#16171B] text-[#E2FE52] hover:bg-black font-extrabold text-xs sm:text-sm shadow-md transition-all duration-150 cursor-pointer ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar gasto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
