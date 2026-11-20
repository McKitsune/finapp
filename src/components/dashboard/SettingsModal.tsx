/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Settings, RotateCcw, Database, ShieldCheck, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movementCount: number;
  onResetDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  movementCount,
  onResetDemoData,
}) => {
  const [resetDone, setResetDone] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleReset = () => {
    if (window.confirm('¿Deseas restablecer todos los movimientos y presupuestos a los valores originales de demostración?')) {
      onResetDemoData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto p-6">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#16171B] flex items-center justify-center text-[#E2FE52]">
              <Settings className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="settings-title" className="text-xl font-extrabold text-[#16171B] tracking-tight">
                Configuración y datos
              </h2>
              <p className="text-xs text-slate-500">
                Almacenamiento y estado de la aplicación
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

        {/* Información de persistencia */}
        <div className="py-5 space-y-4 text-xs sm:text-sm">
          <div className="p-4 bg-[#F8FAFA] rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#16171B]">
              <Database className="w-4 h-4 text-slate-500" />
              <span>Persistencia local activa</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tus ingresos, gastos, ediciones y presupuestos por mes se guardan automáticamente en tu navegador (<strong className="text-slate-700">localStorage</strong>) para que no se pierdan al recargar.
            </p>
            <div className="pt-2 text-xs text-slate-600 font-semibold border-t border-slate-200/60 flex items-center justify-between">
              <span>Movimientos almacenados:</span>
              <span className="font-mono text-slate-900 font-bold">{movementCount} registros</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Este almacenamiento es para pruebas en este dispositivo. No está conectado a un servidor remoto ni expone credenciales privadas.
            </span>
          </div>

          {/* Opción de restablecer */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              {resetDone ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">¡Datos restablecidos a demostración!</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 text-slate-600" />
                  <span>Restablecer datos originales de demostración</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#16171B] text-white hover:bg-black font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
