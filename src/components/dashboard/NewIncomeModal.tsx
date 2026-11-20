/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  Briefcase,
  UserCheck,
  Building2,
  Gift,
  RotateCcw,
  Package,
  Calendar,
  AlertCircle,
  FileText,
  DollarSign,
  CreditCard,
  Info,
} from 'lucide-react';
import { IncomeCategory, NewIncomeFormData } from '../../types/finance.types';
import { formatCurrencyCOP, getTodayISODate } from '../../utils/finance.utils';

interface NewIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveIncome: (formData: NewIncomeFormData) => void;
  defaultDateISO?: string;
}

const INCOME_CATEGORIES: {
  label: IncomeCategory;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: 'Salario', icon: Briefcase },
  { label: 'Trabajo independiente', icon: UserCheck },
  { label: 'Negocio', icon: Building2 },
  { label: 'Bonificación', icon: TrendingUp },
  { label: 'Regalo', icon: Gift },
  { label: 'Reembolso', icon: RotateCcw },
  { label: 'Otros', icon: Package },
];

const PAYMENT_METHODS = [
  'Transferencia bancaria',
  'Efectivo',
  'Billetera digital (Nequi / Daviplata)',
  'Depósito',
  'Cheque',
  'Otro',
];

export const NewIncomeModal: React.FC<NewIncomeModalProps> = ({
  isOpen,
  onClose,
  onSaveIncome,
  defaultDateISO,
}) => {
  const [rawAmount, setRawAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<IncomeCategory>('Salario');
  const [dateStr, setDateStr] = useState<string>(defaultDateISO || getTodayISODate());
  const [paymentMethod, setPaymentMethod] = useState<string>('');
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
      setCategory('Salario');
      setDateStr(defaultDateISO || getTodayISODate());
      setPaymentMethod('');
      setNotes('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, defaultDateISO]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setRawAmount(val);
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
  };

  const parsedAmount = parseInt(rawAmount, 10) || 0;

  const validate = (): boolean => {
    const newErrors: { amount?: string; description?: string; date?: string } = {};

    if (!rawAmount || parsedAmount <= 0) {
      newErrors.amount = 'El valor del ingreso debe ser mayor que cero ($0 COP).';
    } else if (parsedAmount > 1000000000) {
      newErrors.amount = 'El monto excede el límite permitido para este registro.';
    }

    if (!description.trim()) {
      newErrors.description = 'Ingresa una descripción del ingreso (ej: Pago quincenal, Freelance).';
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

    if (!validate()) return;

    setIsSubmitting(true);
    onSaveIncome({
      amountCOP: parsedAmount,
      description: description.trim(),
      category,
      dateStr,
      paymentMethod: paymentMethod.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-income-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 id="new-income-title" className="text-xl sm:text-2xl font-extrabold text-[#16171B] tracking-tight">
                Registrar nuevo ingreso
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Suma fondos adicionales a la capacidad mensual disponible.
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

        {/* Aviso informativo de regla financiera */}
        <div className="mx-6 sm:mx-8 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <span>
            <strong>Nota importante:</strong> Este ingreso se suma a tu capacidad disponible del mes. No registres aquí cantidades que ya contemplaste al definir tu presupuesto base.
          </span>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-5 space-y-4">
          {/* Campo: Valor del ingreso */}
          <div>
            <label htmlFor="income-amount" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Valor del ingreso (COP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <input
                id="income-amount"
                type="text"
                inputMode="numeric"
                value={rawAmount}
                onChange={handleAmountChange}
                placeholder="0"
                autoFocus
                className={`w-full pl-10 pr-20 py-3 rounded-2xl bg-[#F0F2F2] border text-lg sm:text-xl font-extrabold text-emerald-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.amount ? 'border-red-500 focus:ring-red-400' : 'border-transparent focus:ring-emerald-500'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs sm:text-sm font-bold text-slate-500">
                COP
              </div>
            </div>

            {parsedAmount > 0 && (
              <p className="mt-1 text-xs font-semibold text-emerald-700">
                Monto a ingresar: <span className="text-emerald-900 font-extrabold">+{formatCurrencyCOP(parsedAmount)}</span>
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
            <label htmlFor="income-desc" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Descripción <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <input
                id="income-desc"
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                placeholder="Ej: Salario quincenal, Pago proyecto freelance"
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0F2F2] border text-sm font-medium text-[#16171B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.description ? 'border-red-500 focus:ring-red-400' : 'border-transparent focus:ring-emerald-500'
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

          {/* Campo: Categoría */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Categoría de ingreso <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INCOME_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs scale-[1.02]'
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

          {/* Fila doble: Fecha y Medio de recepción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Fecha */}
            <div>
              <label htmlFor="income-date" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
                Fecha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="income-date"
                  type="date"
                  value={dateStr}
                  onChange={(e) => {
                    setDateStr(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0F2F2] border text-sm font-medium text-[#16171B] focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.date ? 'border-red-500 focus:ring-red-400' : 'border-transparent focus:ring-emerald-500'
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

            {/* Medio de recepción */}
            <div>
              <label htmlFor="income-method" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
                Medio de recepción <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <input
                  id="income-method"
                  list="payment-methods-list"
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="Ej: Transferencia, Efectivo"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0F2F2] border border-transparent text-sm font-medium text-[#16171B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <datalist id="payment-methods-list">
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Campo: Observaciones */}
          <div>
            <label htmlFor="income-notes" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Observaciones <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              id="income-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales sobre este ingreso..."
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F0F2F2] border border-transparent text-sm font-medium text-[#16171B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
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
              className={`px-6 py-2.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold text-xs sm:text-sm shadow-md transition-all duration-150 cursor-pointer ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
