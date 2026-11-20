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
  Briefcase,
  UserCheck,
  Building2,
  Gift,
  RotateCcw,
  CreditCard,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  EditMovementFormData,
  ExpenseCategory,
  FinanceMovement,
  IncomeCategory,
} from '../../types/finance.types';
import { formatCurrencyCOP, parseDMYToISO } from '../../utils/finance.utils';

interface EditMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  movement: FinanceMovement | null;
  onSave: (formData: EditMovementFormData) => void;
}

const EXPENSE_CATEGORIES: {
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

export const EditMovementModal: React.FC<EditMovementModalProps> = ({
  isOpen,
  onClose,
  movement,
  onSave,
}) => {
  const [rawAmount, setRawAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory | IncomeCategory>('Alimentación');
  const [dateStr, setDateStr] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [errors, setErrors] = useState<{
    amount?: string;
    description?: string;
    date?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && movement) {
      setRawAmount(movement.amountCOP.toString());
      setDescription(movement.description);
      setCategory(movement.category);
      setDateStr(movement.dateISO || parseDMYToISO(movement.date));
      setPaymentMethod(movement.paymentMethod || '');
      setNotes(movement.notes || '');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, movement]);

  if (!isOpen || !movement) return null;

  const isIncome = movement.type === 'income';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setRawAmount(val);
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
  };

  const parsedAmount = parseInt(rawAmount, 10) || 0;

  const validate = (): boolean => {
    const newErrors: { amount?: string; description?: string; date?: string } = {};

    if (!rawAmount || parsedAmount <= 0) {
      newErrors.amount = 'El monto debe ser mayor que cero ($0 COP).';
    } else if (parsedAmount > 1000000000) {
      newErrors.amount = 'El monto excede el límite permitido.';
    }

    if (!description.trim()) {
      newErrors.description = 'Ingresa una descripción válida.';
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
    onSave({
      id: movement.id,
      type: movement.type,
      amountCOP: parsedAmount,
      description: description.trim(),
      category,
      dateStr,
      paymentMethod: isIncome ? paymentMethod.trim() || undefined : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-movement-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isIncome
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[#16171B] text-[#E2FE52]'
              }`}
            >
              {isIncome ? (
                <TrendingUp className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <TrendingDown className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h2 id="edit-movement-title" className="text-xl sm:text-2xl font-extrabold text-[#16171B] tracking-tight">
                {isIncome ? 'Editar ingreso' : 'Editar gasto'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Modifica los datos del registro y recalcula los indicadores.
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-5 space-y-4 overflow-y-auto flex-1">
          {/* Monto */}
          <div>
            <label htmlFor="edit-amount" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Valor (COP) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <input
                id="edit-amount"
                type="text"
                inputMode="numeric"
                value={rawAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className={`w-full pl-10 pr-20 py-3 rounded-2xl bg-[#F0F2F2] border text-lg sm:text-xl font-extrabold text-[#16171B] focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.amount ? 'border-red-500 focus:ring-red-400' : 'border-transparent focus:ring-[#E2FE52]'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs sm:text-sm font-bold text-slate-500">
                COP
              </div>
            </div>

            {parsedAmount > 0 && (
              <p className="mt-1 text-xs font-semibold text-slate-600">
                Monto: <span className="text-[#16171B] font-bold">{formatCurrencyCOP(parsedAmount)}</span>
              </p>
            )}

            {errors.amount && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="edit-desc" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Descripción <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <input
                id="edit-desc"
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
                }}
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0F2F2] border text-sm font-medium text-[#16171B] focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  errors.description ? 'border-red-500 focus:ring-red-400' : 'border-transparent focus:ring-[#E2FE52]'
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

          {/* Categoría */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Categoría <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label as ExpenseCategory | IncomeCategory)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                      isSelected
                        ? isIncome
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs scale-[1.02]'
                          : 'bg-[#E2FE52] border-[#16171B] text-[#16171B] shadow-xs scale-[1.02]'
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

          {/* Fecha y Medio de recepción si aplica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-date" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
                Fecha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="edit-date"
                  type="date"
                  value={dateStr}
                  onChange={(e) => {
                    setDateStr(e.target.value);
                    if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0F2F2] border text-sm font-medium text-[#16171B] focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                    errors.date ? 'border-red-500 focus:ring-red-400' : 'border-transparent focus:ring-[#E2FE52]'
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

            {isIncome && (
              <div>
                <label htmlFor="edit-payment" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
                  Medio de recepción
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    id="edit-payment"
                    list="edit-payment-methods"
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Ej: Transferencia"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F0F2F2] border border-transparent text-sm font-medium text-[#16171B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all"
                  />
                  <datalist id="edit-payment-methods">
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div>
            <label htmlFor="edit-notes" className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Observaciones <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            <textarea
              id="edit-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles adicionales..."
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F0F2F2] border border-transparent text-sm font-medium text-[#16171B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E2FE52] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Botones */}
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
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
