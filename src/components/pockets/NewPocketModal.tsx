/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Wallet, Calendar, DollarSign, AlertCircle, Sparkles } from 'lucide-react';
import { SavingsPocket, SavingsFrequency, NewPocketFormData } from '../../types/pockets.types';
import { formatCurrencyCOP } from '../../utils/finance.utils';

interface NewPocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  pocketToEdit?: SavingsPocket | null;
  onSave: (data: NewPocketFormData, editId?: string) => void;
}

const COLOR_OPTIONS = [
  '#7666F5', // Violeta
  '#E2FE52', // Lima
  '#3B82F6', // Azul
  '#EC4899', // Rosa
  '#10B981', // Esmeralda
  '#F59E0B', // Ámbar
  '#8B5CF6', // Púrpura
];

export const NewPocketModal: React.FC<NewPocketModalProps> = ({
  isOpen,
  onClose,
  pocketToEdit,
  onSave,
}) => {
  const [name, setName] = useState<string>('');
  const [targetAmountRaw, setTargetAmountRaw] = useState<string>('');
  const [startDateISO, setStartDateISO] = useState<string>('2025-01-01');
  const [targetDateISO, setTargetDateISO] = useState<string>('2025-12-31');
  const [frequency, setFrequency] = useState<SavingsFrequency>('monthly');
  const [plannedPeriodicRaw, setPlannedPeriodicRaw] = useState<string>('');
  const [color, setColor] = useState<string>('#7666F5');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (pocketToEdit) {
        setName(pocketToEdit.name);
        setTargetAmountRaw(pocketToEdit.targetAmountCOP.toString());
        setStartDateISO(pocketToEdit.startDateISO || '2025-01-01');
        setTargetDateISO(pocketToEdit.targetDateISO || '2025-12-31');
        setFrequency(pocketToEdit.frequency || 'monthly');
        setPlannedPeriodicRaw(pocketToEdit.plannedPeriodicAmountCOP.toString());
        setColor(pocketToEdit.color || '#7666F5');
      } else {
        setName('');
        setTargetAmountRaw('');
        setStartDateISO(new Date().toISOString().substring(0, 10));
        setTargetDateISO('2025-12-31');
        setFrequency('monthly');
        setPlannedPeriodicRaw('');
        setColor('#7666F5');
      }
      setError(null);
    }
  }, [isOpen, pocketToEdit]);

  if (!isOpen) return null;

  // Cálculo automático del aporte periódico sugerido
  const targetCOP = parseInt(targetAmountRaw.replace(/[^0-9]/g, ''), 10) || 0;
  
  const handleCalculatePlanned = () => {
    if (targetCOP <= 0) return;
    const start = new Date(startDateISO);
    const target = new Date(targetDateISO);
    if (isNaN(start.getTime()) || isNaN(target.getTime()) || start >= target) return;

    const diffDays = Math.max(1, (target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    let periodDays = 30;
    if (frequency === 'weekly') periodDays = 7;
    if (frequency === 'biweekly') periodDays = 14;

    const periods = Math.max(1, Math.ceil(diffDays / periodDays));
    const suggested = Math.ceil(targetCOP / periods);
    setPlannedPeriodicRaw(suggested.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre del bolsillo es obligatorio.');
      return;
    }
    if (targetCOP <= 0) {
      setError('El objetivo económico debe ser mayor a cero.');
      return;
    }
    if (!startDateISO || !targetDateISO) {
      setError('Las fechas de inicio y cumplimiento son obligatorias.');
      return;
    }
    if (new Date(startDateISO) >= new Date(targetDateISO)) {
      setError('La fecha objetivo debe ser posterior a la fecha de inicio.');
      return;
    }

    const plannedCOP = parseInt(plannedPeriodicRaw.replace(/[^0-9]/g, ''), 10) || 0;

    onSave(
      {
        name: name.trim(),
        targetAmountCOP: targetCOP,
        startDateISO,
        targetDateISO,
        frequency,
        plannedPeriodicAmountCOP: plannedCOP,
        color,
      },
      pocketToEdit ? pocketToEdit.id : undefined
    );
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-pocket-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FE52] flex items-center justify-center text-[#16171B]">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="new-pocket-title" className="text-xl font-extrabold text-[#16171B] tracking-tight">
                {pocketToEdit ? 'Editar bolsillo de ahorro' : 'Nuevo bolsillo de ahorro'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Configura tu meta económica y plan de aportes
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

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Nombre del bolsillo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Viaje a Cartagena, Fondo de Emergencia"
              className="w-full px-4 py-3 rounded-2xl bg-[#F0F2F2] border border-transparent focus:border-[#E2FE52] focus:bg-white text-sm font-semibold text-[#16171B] focus:outline-none focus:ring-2 focus:ring-[#E2FE52]"
              required
            />
          </div>

          {/* Objetivo económico total */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Objetivo económico total (COP) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={targetAmountRaw}
                onChange={(e) => setTargetAmountRaw(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="2.500.000"
                className="w-full pl-10 pr-16 py-3 rounded-2xl bg-[#F0F2F2] border border-transparent focus:border-[#E2FE52] focus:bg-white text-lg font-extrabold text-[#16171B] focus:outline-none focus:ring-2 focus:ring-[#E2FE52] font-mono tabular-nums"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                COP
              </div>
            </div>
            {targetCOP > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Meta: <span className="font-bold text-[#16171B]">{formatCurrencyCOP(targetCOP)}</span>
              </p>
            )}
          </div>

          {/* Fechas de inicio y cumplimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
                Fecha de inicio <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDateISO}
                onChange={(e) => setStartDateISO(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-[#F0F2F2] border border-transparent focus:border-[#E2FE52] focus:bg-white text-xs sm:text-sm font-semibold text-[#16171B] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
                Fecha objetivo de cumplimiento <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={targetDateISO}
                onChange={(e) => setTargetDateISO(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-[#F0F2F2] border border-transparent focus:border-[#E2FE52] focus:bg-white text-xs sm:text-sm font-semibold text-[#16171B] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Frecuencia de ahorro */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Frecuencia de ahorro
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['weekly', 'biweekly', 'monthly'] as SavingsFrequency[]).map((freq) => {
                const labels: Record<SavingsFrequency, string> = {
                  weekly: 'Semanal',
                  biweekly: 'Quincenal',
                  monthly: 'Mensual',
                };
                return (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      frequency === freq
                        ? 'bg-[#16171B] text-[#E2FE52] border-black shadow-xs'
                        : 'bg-[#F0F2F2] text-slate-700 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    {labels[freq]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aporte periódico planificado */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-[#16171B]">
                Aporte periódico planificado (COP)
              </label>
              {targetCOP > 0 && (
                <button
                  type="button"
                  onClick={handleCalculatePlanned}
                  className="text-xs font-bold text-[#7666F5] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Calcular sugerido</span>
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={plannedPeriodicRaw}
                onChange={(e) => setPlannedPeriodicRaw(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="350.000"
                className="w-full pl-10 pr-16 py-3 rounded-2xl bg-[#F0F2F2] border border-transparent focus:border-[#E2FE52] focus:bg-white text-base font-bold text-[#16171B] focus:outline-none focus:ring-2 focus:ring-[#E2FE52] font-mono tabular-nums"
              />
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-500">
                COP
              </div>
            </div>
          </div>

          {/* Color identificador */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#16171B] mb-1.5">
              Color identificador
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-[#16171B] scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Seleccionar color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#16171B] text-[#E2FE52] hover:bg-black font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              {pocketToEdit ? 'Guardar cambios' : 'Crear bolsillo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
