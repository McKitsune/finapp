/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  History,
  TrendingDown,
  TrendingUp,
  ArrowUpDown,
  Filter,
  RotateCcw,
  Receipt,
  FileQuestion,
} from 'lucide-react';
import { FinanceMovement } from '../../types/finance.types';
import { formatCurrencyCOP } from '../../utils/finance.utils';
import { MovementItem } from './MovementItem';
import { EmptyState } from '../common/EmptyState';

interface MovementHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodLabel: string;
  movements: FinanceMovement[];
  onSelectMovement: (item: FinanceMovement) => void;
  onOpenNewExpense?: () => void;
  onOpenNewIncome?: () => void;
}

export const MovementHistoryModal: React.FC<MovementHistoryModalProps> = ({
  isOpen,
  onClose,
  periodLabel,
  movements,
  onSelectMovement,
  onOpenNewExpense,
  onOpenNewIncome,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Conteo base por tipo antes de filtros
  const totalExpenseCount = useMemo(() => {
    return movements.filter((m) => m.type === 'expense').length;
  }, [movements]);

  const totalIncomeCount = useMemo(() => {
    return movements.filter((m) => m.type === 'income').length;
  }, [movements]);

  // Categorías presentes en los movimientos del período
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    movements.forEach((m) => cats.add(m.category));
    return Array.from(cats);
  }, [movements]);

  // Filtrado y ordenamiento de movimientos
  const filteredMovements = useMemo(() => {
    return movements
      .filter((item) => {
        // Filtro por tipo
        if (typeFilter !== 'all' && item.type !== typeFilter) return false;

        // Filtro por categoría
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

        // Búsqueda por texto
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchDesc = item.description.toLowerCase().includes(query);
          const matchCat = item.category.toLowerCase().includes(query);
          const matchDate = (item.dateFormattedSpanish || item.date).toLowerCase().includes(query);
          return matchDesc || matchCat || matchDate;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = a.dateISO ? new Date(a.dateISO).getTime() : 0;
        const timeB = b.dateISO ? new Date(b.dateISO).getTime() : 0;
        if (sortOrder === 'desc') {
          return timeB - timeA || (b.createdAt || 0) - (a.createdAt || 0);
        }
        return timeA - timeB || (a.createdAt || 0) - (b.createdAt || 0);
      });
  }, [movements, typeFilter, categoryFilter, searchQuery, sortOrder]);

  // Totales filtrados
  const totals = useMemo(() => {
    const totalExpenses = filteredMovements
      .filter((m) => m.type === 'expense')
      .reduce((acc, curr) => acc + curr.amountCOP, 0);

    const totalIncome = filteredMovements
      .filter((m) => m.type === 'income')
      .reduce((acc, curr) => acc + curr.amountCOP, 0);

    return { totalExpenses, totalIncome };
  }, [filteredMovements]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
  };

  const hasActiveFilters = searchQuery !== '' || typeFilter !== 'all' || categoryFilter !== 'all';

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto flex flex-col max-h-[88vh]">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E2FE52] flex items-center justify-center text-[#16171B]">
              <History className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="history-modal-title" className="text-xl sm:text-2xl font-extrabold text-[#16171B] tracking-tight">
                Historial de movimientos
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Período: <strong className="text-slate-800">{periodLabel}</strong> · {movements.length} movimientos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar historial"
            className="w-10 h-10 rounded-full bg-[#F0F2F2] hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de búsqueda y controles de filtro */}
        {movements.length > 0 && (
          <div className="px-6 sm:px-8 py-3.5 bg-[#F8FAFA] border-b border-slate-100 shrink-0 space-y-3">
            {/* Fila superior: Buscador y Ordenamiento */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por descripción o fecha..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-[#16171B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E2FE52] shadow-2xs"
                />
              </div>

              {/* Alternar orden cronológico */}
              <button
                type="button"
                onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs transition-colors cursor-pointer"
                title="Cambiar orden por fecha"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">{sortOrder === 'desc' ? 'Más recientes' : 'Más antiguos'}</span>
              </button>
            </div>

            {/* Fila inferior: Segmentos de Tipo y selector de categoría */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Filtro por tipo de movimiento */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setTypeFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    typeFilter === 'all'
                      ? 'bg-[#16171B] text-[#E2FE52] shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  Todos ({movements.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('expense')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    typeFilter === 'expense'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <TrendingDown className="w-3 h-3" />
                  <span>Gastos ({totalExpenseCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter('income')}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    typeFilter === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>Ingresos ({totalIncomeCount})</span>
                </button>
              </div>

              {/* Filtro por categoría */}
              {availableCategories.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E2FE52] shadow-2xs cursor-pointer"
                  >
                    <option value="all">Todas las categorías</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lista de movimientos o estados vacíos diferenciados */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4">
          {movements.length === 0 ? (
            /* Situación 1: Historial completo sin ningún movimiento en el mes */
            <div className="py-8">
              <EmptyState
                icon={<Receipt className="w-8 h-8 text-slate-400" />}
                title="Aún no tienes movimientos registrados en este mes"
                description="Comienza registrando tus gastos habituales o ingresos adicionales para mantener tus finanzas al día."
                actionLabel="Registrar gasto"
                onAction={() => {
                  onClose();
                  onOpenNewExpense?.();
                }}
                secondaryActionLabel="Registrar ingreso"
                onSecondaryAction={() => {
                  onClose();
                  onOpenNewIncome?.();
                }}
              />
            </div>
          ) : filteredMovements.length === 0 ? (
            /* Situación 2: El mes tiene movimientos, pero la búsqueda o filtros no arrojan resultados */
            <div className="py-8">
              {typeFilter === 'expense' && totalExpenseCount === 0 ? (
                /* Historial con ingresos, pero sin gastos */
                <EmptyState
                  icon={<TrendingDown className="w-8 h-8 text-rose-400" />}
                  title="No has registrado gastos en este período"
                  description="Aún no tienes gastos contabilizados en este mes. Solo tienes ingresos adicionales registrados."
                  actionLabel="Registrar gasto"
                  onAction={() => {
                    onClose();
                    onOpenNewExpense?.();
                  }}
                />
              ) : typeFilter === 'income' && totalIncomeCount === 0 ? (
                /* Historial con gastos, pero sin ingresos adicionales */
                <EmptyState
                  icon={<TrendingUp className="w-8 h-8 text-emerald-500" />}
                  title="No has registrado ingresos adicionales en este período"
                  description="Los ingresos adicionales amplían la capacidad disponible sobre tu presupuesto base mensual."
                  actionLabel="Registrar ingreso"
                  onAction={() => {
                    onClose();
                    onOpenNewIncome?.();
                  }}
                />
              ) : (
                /* Búsqueda o categoría sin coincidencias */
                <div className="flex flex-col items-center justify-center text-center py-10 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F0F2F2] flex items-center justify-center text-slate-500 mb-3">
                    <FileQuestion className="w-7 h-7" />
                  </div>
                  <h3 className="font-extrabold text-[#16171B] text-base">
                    No encontramos movimientos con estos filtros.
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Prueba cambiando los términos de búsqueda o selecciona otra categoría.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpiar filtros</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ul role="list" className="space-y-1">
              {filteredMovements.map((item) => (
                <MovementItem
                  key={item.id}
                  item={item}
                  onSelect={onSelectMovement}
                  showChevron={true}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Pie del modal con balance y cierre */}
        <div className="px-6 sm:px-8 py-4 bg-[#F8FAFA] border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs sm:text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500">Gastos: </span>
              <span className="font-extrabold text-[#16171B]">
                {formatCurrencyCOP(totals.totalExpenses)}
              </span>
            </div>
            {totals.totalIncome > 0 && (
              <div>
                <span className="text-slate-500">Ingresos: </span>
                <span className="font-extrabold text-emerald-700">
                  +{formatCurrencyCOP(totals.totalIncome)}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#16171B] text-white hover:bg-black font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
