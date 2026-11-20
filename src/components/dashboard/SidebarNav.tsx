/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Home,
  History,
  Calendar,
  Wallet,
  PiggyBank,
  Bot,
  Settings,
} from 'lucide-react';

interface SidebarNavProps {
  activeView: 'home' | 'history';
  onNavigateHome: () => void;
  onOpenHistory: () => void;
  onOpenMonthSelector: () => void;
  onOpenEditBudget: () => void;
  onOpenPockets: () => void;
  onOpenAssistant: () => void;
  onOpenSettings: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeView,
  onNavigateHome,
  onOpenHistory,
  onOpenMonthSelector,
  onOpenEditBudget,
  onOpenPockets,
  onOpenAssistant,
  onOpenSettings,
}) => {
  return (
    <>
      {/* Barra lateral vertical para pantallas de escritorio (Desktop Sidebar) */}
      <aside
        aria-label="Navegación principal"
        className="hidden lg:flex flex-col items-center justify-between w-20 bg-[#16171B] rounded-[32px] py-6 px-3 shadow-xl shrink-0 select-none my-1"
      >
        {/* Logo superior */}
        <div className="flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-12 h-12 rounded-2xl border border-white/20 bg-white/5 flex items-center justify-center shadow-inner cursor-pointer transition-transform hover:scale-105"
            title="Mi Presupuesto Mensual - Inicio"
          >
            {/* Ícono de barras gráficas redondeadas */}
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <rect x="4" y="10" width="3.5" height="10" rx="1.75" />
              <rect x="10.25" y="5" width="3.5" height="15" rx="1.75" />
              <rect x="16.5" y="12" width="3.5" height="8" rx="1.75" />
            </svg>
          </button>

          {/* Menú de navegación principal con acciones funcionales reales */}
          <nav className="flex flex-col items-center gap-3 mt-2">
            {/* 1. Dashboard / Inicio */}
            <button
              type="button"
              onClick={onNavigateHome}
              aria-label="Inicio / Dashboard"
              title="Dashboard principal"
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                activeView === 'home'
                  ? 'bg-white/12 text-[#E2FE52] shadow-sm ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Home className="w-5 h-5" />
            </button>

            {/* 2. Historial de movimientos */}
            <button
              type="button"
              onClick={onOpenHistory}
              aria-label="Historial de movimientos"
              title="Ver historial completo de movimientos"
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
            >
              <History className="w-5 h-5" />
            </button>

            {/* 3. Selector de meses y períodos */}
            <button
              type="button"
              onClick={onOpenMonthSelector}
              aria-label="Seleccionar mes y año"
              title="Cambiar período mensual"
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
            >
              <Calendar className="w-5 h-5" />
            </button>

            {/* 4. Editar presupuesto base */}
            <button
              type="button"
              onClick={onOpenEditBudget}
              aria-label="Editar presupuesto"
              title="Modificar presupuesto del mes"
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
            >
              <Wallet className="w-5 h-5" />
            </button>

            {/* 5. Bolsillos de ahorro */}
            <button
              type="button"
              onClick={onOpenPockets}
              aria-label="Bolsillos de ahorro y metas"
              title="Bolsillos de ahorro y metas económicas"
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#E2FE52] hover:bg-white/5 transition-all duration-200 cursor-pointer"
            >
              <PiggyBank className="w-5 h-5" />
            </button>

            {/* 6. Asistente Financiero AI */}
            <button
              type="button"
              onClick={onOpenAssistant}
              aria-label="Asistente financiero con inteligencia artificial"
              title="Asistente financiero AI"
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#E2FE52] hover:bg-white/5 transition-all duration-200 cursor-pointer relative group"
            >
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E2FE52] rounded-full border-2 border-[#16171B]" />
            </button>
          </nav>
        </div>

        {/* Ajustes e información en la parte inferior */}
        <div className="pt-4">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Configuración y datos"
            title="Ajustes y reinicio de datos locales"
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Barra de navegación inferior en dispositivos móviles */}
      <nav
        aria-label="Navegación móvil"
        className="lg:hidden fixed bottom-3 left-4 right-4 z-40 bg-[#16171B]/95 backdrop-blur-md text-white rounded-2xl px-3 py-2.5 flex items-center justify-around shadow-2xl border border-white/10"
      >
        <button
          type="button"
          onClick={onNavigateHome}
          aria-label="Inicio"
          className={`p-2 rounded-xl transition-colors ${
            activeView === 'home' ? 'bg-white/20 text-[#E2FE52]' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onOpenHistory}
          aria-label="Historial"
          className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <History className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onOpenMonthSelector}
          aria-label="Calendario de meses"
          className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <Calendar className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onOpenEditBudget}
          aria-label="Presupuesto"
          className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <Wallet className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onOpenPockets}
          aria-label="Bolsillos de ahorro"
          className="p-2 rounded-xl text-slate-400 hover:text-[#E2FE52] transition-colors"
        >
          <PiggyBank className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onOpenAssistant}
          aria-label="Asistente AI"
          className="p-2 rounded-xl text-[#E2FE52] bg-white/10 transition-colors"
        >
          <Bot className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Ajustes"
          className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </nav>
    </>
  );
};
