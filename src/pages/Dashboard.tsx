/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import {
  FinanceMovement,
  NewExpenseFormData,
  NewIncomeFormData,
  EditMovementFormData,
  PeriodIdentifier,
} from '../types/finance.types';
import { StorageService } from '../services/storage.service';
import {
  DEFAULT_PERIOD,
  DEFAULT_BUDGET_COP,
  INITIAL_MOCK_MOVEMENTS,
} from '../data/mockFinance';
import {
  calculateFinancialSummary,
  calculateDailyChartBars,
  filterMovementsByPeriod,
  parseISOToDMY,
  formatDateToSpanish,
  formatCurrencyCOP,
  getPeriodFromDate,
} from '../utils/finance.utils';
import { SidebarNav } from '../components/dashboard/SidebarNav';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { BudgetProgress } from '../components/dashboard/BudgetProgress';
import { DailyExpensesChart } from '../components/dashboard/DailyExpensesChart';
import { RecentMovements } from '../components/dashboard/RecentMovements';
import { NewExpenseModal } from '../components/dashboard/NewExpenseModal';
import { NewIncomeModal } from '../components/dashboard/NewIncomeModal';
import { EditBudgetModal } from '../components/dashboard/EditBudgetModal';
import { MovementHistoryModal } from '../components/dashboard/MovementHistoryModal';
import { MovementDetailModal } from '../components/dashboard/MovementDetailModal';
import { EditMovementModal } from '../components/dashboard/EditMovementModal';
import { DeleteConfirmModal } from '../components/dashboard/DeleteConfirmModal';
import { MonthSelectorModal } from '../components/dashboard/MonthSelectorModal';
import { SettingsModal } from '../components/dashboard/SettingsModal';

export const Dashboard: React.FC = () => {
  // 1. Estado de persistencia local (Movimientos y Presupuestos)
  const [movements, setMovements] = useState<FinanceMovement[]>(() => {
    return StorageService.loadMovements();
  });

  const [budgets, setBudgets] = useState<Record<string, number>>(() => {
    return StorageService.loadBudgets();
  });

  const [activePeriod, setActivePeriod] = useState<PeriodIdentifier>(() => {
    return StorageService.loadActivePeriod();
  });

  // Guardar cambios de período en localStorage
  useEffect(() => {
    StorageService.saveActivePeriod(activePeriod);
  }, [activePeriod]);

  // 2. Modales y estados de interfaz
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState<boolean>(false);
  const [isNewIncomeOpen, setIsNewIncomeOpen] = useState<boolean>(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [selectedMovementForDetail, setSelectedMovementForDetail] = useState<FinanceMovement | null>(null);
  const [movementToEdit, setMovementToEdit] = useState<FinanceMovement | null>(null);
  const [movementToDelete, setMovementToDelete] = useState<FinanceMovement | null>(null);

  // Notificación toast visual
  const [toast, setToast] = useState<{
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  const showToast = (
    message: string,
    action?: { label: string; onAction: () => void }
  ) => {
    setToast({
      message,
      actionLabel: action?.label,
      onAction: action?.onAction,
    });
    setTimeout(() => {
      setToast(null);
    }, 5500);
  };

  // 3. Cálculos financieros centralizados para el período activo
  const activeBudgetCOP = budgets[activePeriod.key] ?? DEFAULT_BUDGET_COP;

  const periodMovements = useMemo(() => {
    return filterMovementsByPeriod(movements, activePeriod.key);
  }, [movements, activePeriod.key]);

  const summary = useMemo(() => {
    return calculateFinancialSummary(activeBudgetCOP, periodMovements);
  }, [activeBudgetCOP, periodMovements]);

  const chartBars = useMemo(() => {
    return calculateDailyChartBars(periodMovements, activePeriod);
  }, [periodMovements, activePeriod]);

  // 4. Operaciones funcionales

  // A. Guardar nuevo gasto
  const handleSaveExpense = (formData: NewExpenseFormData) => {
    const dateDMY = parseISOToDMY(formData.dateStr);
    const dateFormattedSpanish = formatDateToSpanish(formData.dateStr);
    const movementPeriod = getPeriodFromDate(formData.dateStr);

    const newExpense: FinanceMovement = {
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'expense',
      date: dateDMY,
      dateISO: formData.dateStr,
      dateFormattedSpanish,
      description: formData.description,
      category: formData.category,
      amountCOP: formData.amountCOP,
      notes: formData.notes,
      createdAt: Date.now(),
    };

    const updated = [newExpense, ...movements];
    setMovements(updated);
    const saved = StorageService.saveMovements(updated);
    setIsNewExpenseOpen(false);

    if (!saved) {
      showToast('Error al persistir el nuevo gasto en el almacenamiento local.');
      return;
    }

    if (movementPeriod.key !== activePeriod.key) {
      showToast(
        `Gasto "${newExpense.description}" registrado para ${movementPeriod.label}.`,
        {
          label: `Ver ${movementPeriod.label}`,
          onAction: () => setActivePeriod(movementPeriod),
        }
      );
    } else {
      showToast(
        `Gasto "${newExpense.description}" (${formatCurrencyCOP(newExpense.amountCOP)}) registrado con éxito.`
      );
    }
  };

  // B. Guardar nuevo ingreso adicional
  const handleSaveIncome = (formData: NewIncomeFormData) => {
    const dateDMY = parseISOToDMY(formData.dateStr);
    const dateFormattedSpanish = formatDateToSpanish(formData.dateStr);
    const movementPeriod = getPeriodFromDate(formData.dateStr);

    const newIncome: FinanceMovement = {
      id: `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'income',
      date: dateDMY,
      dateISO: formData.dateStr,
      dateFormattedSpanish,
      description: formData.description,
      category: formData.category,
      amountCOP: formData.amountCOP,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
      createdAt: Date.now(),
    };

    const updated = [newIncome, ...movements];
    setMovements(updated);
    const saved = StorageService.saveMovements(updated);
    setIsNewIncomeOpen(false);

    if (!saved) {
      showToast('Error al persistir el ingreso en el almacenamiento local.');
      return;
    }

    if (movementPeriod.key !== activePeriod.key) {
      showToast(
        `Ingreso adicional registrado para ${movementPeriod.label}.`,
        {
          label: `Ver ${movementPeriod.label}`,
          onAction: () => setActivePeriod(movementPeriod),
        }
      );
    } else {
      showToast(
        `Ingreso "+${formatCurrencyCOP(newIncome.amountCOP)}" registrado exitosamente.`
      );
    }
  };

  // C. Guardar presupuesto del mes
  const handleSaveBudget = (newBudgetCOP: number) => {
    const updatedBudgets = StorageService.setBudgetForPeriod(
      activePeriod.key,
      newBudgetCOP
    );
    setBudgets({ ...updatedBudgets });
    setIsEditBudgetOpen(false);
    showToast(
      `Presupuesto de ${activePeriod.label} actualizado a ${formatCurrencyCOP(newBudgetCOP)}.`
    );
  };

  // D. Guardar edición de movimiento
  const handleSaveEditMovement = (formData: EditMovementFormData) => {
    const dateDMY = parseISOToDMY(formData.dateStr);
    const dateFormattedSpanish = formatDateToSpanish(formData.dateStr);
    const targetPeriod = getPeriodFromDate(formData.dateStr);

    const updated = movements.map((m) => {
      if (m.id === formData.id) {
        return {
          ...m,
          amountCOP: formData.amountCOP,
          description: formData.description,
          category: formData.category,
          date: dateDMY,
          dateISO: formData.dateStr,
          dateFormattedSpanish,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
        };
      }
      return m;
    });

    setMovements(updated);
    const saved = StorageService.saveMovements(updated);
    setMovementToEdit(null);
    setSelectedMovementForDetail(null);

    if (!saved) {
      showToast('Error al actualizar el movimiento en el almacenamiento local.');
      return;
    }

    showToast(
      `Movimiento actualizado con éxito (${formatCurrencyCOP(formData.amountCOP)}).`
    );

    // Si cambió de mes, ofrecer verlo
    if (targetPeriod.key !== activePeriod.key) {
      showToast(
        `El movimiento fue movido a ${targetPeriod.label}.`,
        {
          label: `Ir a ${targetPeriod.label}`,
          onAction: () => setActivePeriod(targetPeriod),
        }
      );
    }
  };

  // E. Eliminar movimiento confirmado
  const handleConfirmDelete = (id: string) => {
    const deleted = movements.find((m) => m.id === id);
    const updated = movements.filter((m) => m.id !== id);

    setMovements(updated);
    const saved = StorageService.saveMovements(updated);
    setMovementToDelete(null);
    setSelectedMovementForDetail(null);

    if (!saved) {
      showToast('Error al eliminar el movimiento del almacenamiento local.');
      return;
    }

    showToast(
      `Movimiento "${deleted?.description || 'seleccionado'}" eliminado correctamente.`
    );
  };

  // F. Restablecer datos de demostración
  const handleResetDemoData = () => {
    setMovements(INITIAL_MOCK_MOVEMENTS);
    StorageService.saveMovements(INITIAL_MOCK_MOVEMENTS);

    const defaultBudgets: Record<string, number> = {
      [DEFAULT_PERIOD.key]: DEFAULT_BUDGET_COP,
    };
    setBudgets(defaultBudgets);
    StorageService.saveBudgets(defaultBudgets);

    setActivePeriod(DEFAULT_PERIOD);
    StorageService.saveActivePeriod(DEFAULT_PERIOD);

    showToast('Datos de demostración restablecidos correctamente.');
  };

  // G. Manejo de apertura de edición/eliminación desde Detalle
  const handleOpenEditFromDetail = (item: FinanceMovement) => {
    setSelectedMovementForDetail(null);
    setMovementToEdit(item);
  };

  const handleOpenDeleteFromDetail = (item: FinanceMovement) => {
    setSelectedMovementForDetail(null);
    setMovementToDelete(item);
  };

  // Fecha predeterminada para nuevos registros en el período actual
  const defaultFormDateISO = `${activePeriod.year}-${activePeriod.month.toString().padStart(2, '0')}-15`;

  return (
    <div className="min-h-screen bg-[#ECEFEF] text-[#16171B] p-3 sm:p-5 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 pb-24 lg:pb-6 font-sans">
      {/* Barra lateral de navegación con acciones funcionales reales */}
      <SidebarNav
        activeView="home"
        onNavigateHome={() => {
          setIsHistoryOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenMonthSelector={() => setIsMonthSelectorOpen(true)}
        onOpenEditBudget={() => setIsEditBudgetOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Contenido principal del Dashboard */}
      <main className="flex-1 max-w-[1340px] w-full mx-auto">
        {/* A. Encabezado principal */}
        <DashboardHeader
          periodLabel={activePeriod.label}
          onOpenMonthSelector={() => setIsMonthSelectorOpen(true)}
        />

        {/* B. Resumen financiero (Presupuesto editable, Total gastado, Saldo disponible con ingresos) */}
        <SummaryCard
          summary={summary}
          onOpenEditBudget={() => setIsEditBudgetOpen(true)}
        />

        {/* C. Acciones rápidas requeridas (+ Registrar ingreso / + Registrar gasto) */}
        <QuickActions
          onOpenNewIncome={() => setIsNewIncomeOpen(true)}
          onOpenNewExpense={() => setIsNewExpenseOpen(true)}
        />

        {/* D. Progreso del presupuesto (Cálculo corregido sin sumar 101%) */}
        <BudgetProgress summary={summary} />

        {/* E y F. Bloque inferior: Comportamiento de gastos del mes y Últimos movimientos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <DailyExpensesChart
              periodLabel={activePeriod.label}
              bars={chartBars}
              onOpenMonthSelector={() => setIsMonthSelectorOpen(true)}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
            />
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <RecentMovements
              movements={periodMovements}
              periodLabel={activePeriod.label}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onSelectMovement={(item) => setSelectedMovementForDetail(item)}
              onOpenNewExpense={() => setIsNewExpenseOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* MODAL 1: Registrar nuevo gasto */}
      <NewExpenseModal
        isOpen={isNewExpenseOpen}
        onClose={() => setIsNewExpenseOpen(false)}
        onSaveExpense={handleSaveExpense}
        defaultDateISO={defaultFormDateISO}
        activePeriodKey={activePeriod.key}
      />

      {/* MODAL 2: Registrar nuevo ingreso adicional */}
      <NewIncomeModal
        isOpen={isNewIncomeOpen}
        onClose={() => setIsNewIncomeOpen(false)}
        onSaveIncome={handleSaveIncome}
        defaultDateISO={defaultFormDateISO}
      />

      {/* MODAL 3: Editar presupuesto mensual del período */}
      <EditBudgetModal
        isOpen={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
        currentBudgetCOP={activeBudgetCOP}
        periodLabel={activePeriod.label}
        onSaveBudget={handleSaveBudget}
      />

      {/* MODAL 4: Historial completo de movimientos con filtros y búsqueda */}
      <MovementHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        periodLabel={activePeriod.label}
        movements={periodMovements}
        onSelectMovement={(item) => setSelectedMovementForDetail(item)}
        onOpenNewExpense={() => setIsNewExpenseOpen(true)}
        onOpenNewIncome={() => setIsNewIncomeOpen(true)}
      />

      {/* MODAL 5: Detalle de movimiento con botones Editar y Eliminar funcionales */}
      <MovementDetailModal
        item={selectedMovementForDetail}
        onClose={() => setSelectedMovementForDetail(null)}
        onBack={isHistoryOpen ? () => setSelectedMovementForDetail(null) : undefined}
        onEdit={handleOpenEditFromDetail}
        onDelete={handleOpenDeleteFromDetail}
      />

      {/* MODAL 6: Editar movimiento (gasto o ingreso) */}
      <EditMovementModal
        isOpen={Boolean(movementToEdit)}
        onClose={() => setMovementToEdit(null)}
        movement={movementToEdit}
        onSave={handleSaveEditMovement}
      />

      {/* MODAL 7: Confirmar eliminación de movimiento */}
      <DeleteConfirmModal
        isOpen={Boolean(movementToDelete)}
        onClose={() => setMovementToDelete(null)}
        movement={movementToDelete}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* MODAL 8: Selector interactivo de mes y año */}
      <MonthSelectorModal
        isOpen={isMonthSelectorOpen}
        onClose={() => setIsMonthSelectorOpen(false)}
        activePeriod={activePeriod}
        onSelectPeriod={(p) => setActivePeriod(p)}
        allMovements={movements}
      />

      {/* MODAL 9: Ajustes, estado de almacenamiento y reinicio de demostración */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        movementCount={movements.length}
        onResetDemoData={handleResetDemoData}
      />

      {/* Notificación flotante de confirmación visual (Toast) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md bg-[#16171B] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-white/10 animate-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#E2FE52] flex items-center justify-center text-[#16171B] shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold truncate">{toast.message}</p>
              {toast.actionLabel && toast.onAction && (
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction?.();
                    setToast(null);
                  }}
                  className="text-xs font-bold text-[#E2FE52] underline hover:text-white mt-0.5 cursor-pointer"
                >
                  {toast.actionLabel}
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
