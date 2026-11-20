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
  getTodayISODate,
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
import {
  SavingsPocket,
  SavingsMovement,
  NewPocketFormData,
  NewSavingsMovementFormData,
  TransferPocketFormData,
} from '../types/pockets.types';
import { PocketsStorageService } from '../services/pocketsStorage.service';
import { captureBackup, downloadBackup, restoreBackup, validateBackup } from '../services/backup.service';
import { INITIAL_MOCK_POCKETS, INITIAL_MOCK_SAVINGS_MOVEMENTS } from '../data/mockPockets';
import { calculatePocketCurrentSaved } from '../utils/pockets.utils';
import { PocketsModal } from '../components/pockets/PocketsModal';
import { AsistenteFinancieroModal } from '../components/assistant/AsistenteFinancieroModal';
import { PiggyBank } from 'lucide-react';
import { ReceiptScannerModal } from '../components/receipts/ReceiptScannerModal';

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
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState<boolean>(false);

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
  const activeBudgetCOP = budgets[activePeriod.key] ?? 0;

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
      receipt: formData.receipt,
      createdAt: Date.now(),
    };

    const updated = [newExpense, ...movements];
    const saved = StorageService.saveMovements(updated);
    if (!saved) {
      showToast('Error al persistir el gasto: los datos no se modificaron.');
      return false;
    }
    setMovements(updated);
    setIsNewExpenseOpen(false);

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
    return true;
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
    const saved = StorageService.saveMovements(updated);
    if (!saved) {
      showToast('Error al persistir el ingreso: los datos no se modificaron.');
      return false;
    }
    setMovements(updated);
    setIsNewIncomeOpen(false);

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
    return true;
  };

  // C. Guardar presupuesto del mes
  const handleSaveBudget = (newBudgetCOP: number) => {
    if (!Number.isSafeInteger(newBudgetCOP) || newBudgetCOP <= 0) { showToast('El presupuesto debe ser un entero positivo en COP.'); return; }
    const updatedBudgets = { ...budgets, [activePeriod.key]: newBudgetCOP };
    if (!StorageService.saveBudgets(updatedBudgets)) { showToast('No se pudo guardar el presupuesto.'); return; }
    setBudgets(updatedBudgets);
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

    const saved = StorageService.saveMovements(updated);
    if (!saved) { showToast('No se pudo guardar la edición.'); return; }
    setMovements(updated);
    setMovementToEdit(null);
    setSelectedMovementForDetail(null);

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

    const saved = StorageService.saveMovements(updated);
    if (!saved) { showToast('No se pudo guardar la eliminación.'); return; }
    setMovements(updated);
    setMovementToDelete(null);
    setSelectedMovementForDetail(null);

    showToast(
      `Movimiento "${deleted?.description || 'seleccionado'}" eliminado correctamente.`
    );
  };

  // F. Restablecer datos de demostración
  const handleResetDemoData = () => {
    if (!StorageService.saveMovements(INITIAL_MOCK_MOVEMENTS)) { showToast('Error al restablecer los datos.'); return; }
    setMovements(INITIAL_MOCK_MOVEMENTS);

    const defaultBudgets: Record<string, number> = {
      [DEFAULT_PERIOD.key]: DEFAULT_BUDGET_COP,
    };
    setBudgets(defaultBudgets);
    StorageService.saveBudgets(defaultBudgets);

    setActivePeriod(DEFAULT_PERIOD);
    StorageService.saveActivePeriod(DEFAULT_PERIOD);
    PocketsStorageService.savePockets(INITIAL_MOCK_POCKETS);
    PocketsStorageService.saveSavingsMovements(INITIAL_MOCK_SAVINGS_MOVEMENTS);
    setPockets(INITIAL_MOCK_POCKETS);
    setSavingsMovements(INITIAL_MOCK_SAVINGS_MOVEMENTS);

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

  // H. Manejo de Bolsillos de Ahorro y Metas
  const [pockets, setPockets] = useState<SavingsPocket[]>(() => {
    return PocketsStorageService.loadPockets();
  });
  const [savingsMovements, setSavingsMovements] = useState<SavingsMovement[]>(() => {
    return PocketsStorageService.loadSavingsMovements();
  });
  const [isPocketsOpen, setIsPocketsOpen] = useState<boolean>(false);

  const handleSavePocket = (data: NewPocketFormData, editId?: string) => {
    if (editId) {
      const updated = pockets.map((p) => (p.id === editId ? { ...p, ...data } : p));
      if (!PocketsStorageService.savePockets(updated)) { showToast('No se pudo guardar el bolsillo.'); return; }
      setPockets(updated);
      showToast(`Bolsillo "${data.name}" actualizado con éxito.`);
    } else {
      const newPocket: SavingsPocket = {
        id: `pocket-${Date.now()}`,
        ...data,
        createdAt: Date.now(),
      };
      const updated = [newPocket, ...pockets];
      if (!PocketsStorageService.savePockets(updated)) { showToast('No se pudo crear el bolsillo.'); return; }
      setPockets(updated);
      showToast(`Bolsillo "${data.name}" creado correctamente.`);
    }
  };

  const handleDeletePocket = (pocketId: string) => {
    const pocket = pockets.find((p) => p.id === pocketId);
    if (calculatePocketCurrentSaved(pocketId, savingsMovements) !== 0 || savingsMovements.some(m => m.pocketId === pocketId && m.type.startsWith('transfer'))) {
      showToast('No se puede eliminar: vacía el bolsillo y conserva el historial de transferencias.');
      return;
    }
    if (!window.confirm(`¿Eliminar el bolsillo "${pocket?.name}" y su historial? Esta acción no se puede deshacer.`)) return;
    const updatedPockets = pockets.filter((p) => p.id !== pocketId);
    const updatedMoves = savingsMovements.filter((m) => m.pocketId !== pocketId);
    if (!PocketsStorageService.savePockets(updatedPockets) || !PocketsStorageService.saveSavingsMovements(updatedMoves)) {
      showToast('No fue posible eliminar el bolsillo del almacenamiento.'); return;
    }
    setPockets(updatedPockets);
    setSavingsMovements(updatedMoves);
    showToast(`Bolsillo "${pocket?.name || 'seleccionado'}" eliminado.`);
  };

  const handleSaveSavingsMovement = (formData: NewSavingsMovementFormData): boolean => {
    const current = calculatePocketCurrentSaved(formData.pocketId, savingsMovements);
    const targetPeriod = getPeriodFromDate(formData.dateStr).key;
    const financial = calculateFinancialSummary(budgets[targetPeriod] ?? 0, filterMovementsByPeriod(movements, targetPeriod));
    const netSavedForPeriod = savingsMovements.filter(m => m.dateISO.startsWith(targetPeriod) && ['deposit','withdrawal'].includes(m.type))
      .reduce((sum,m)=>sum + (m.type === 'deposit' ? m.amountCOP : -m.amountCOP), 0);
    if (formData.type === 'deposit' && financial.availableBalanceCOP - netSavedForPeriod < formData.amountCOP) {
      showToast('El aporte supera el dinero libre de ese mes. Revisa presupuesto, gastos y aportes.'); return false;
    }
    if (!pockets.some(p => p.id === formData.pocketId) || !Number.isSafeInteger(formData.amountCOP) || formData.amountCOP <= 0 ||
        (formData.type === 'withdrawal' && current < formData.amountCOP)) {
      showToast('No fue posible registrar el ahorro: verifica monto, bolsillo y saldo.'); return false;
    }
    const dateDMY = parseISOToDMY(formData.dateStr);
    const dateFormattedSpanish = formatDateToSpanish(formData.dateStr);

    const newMov: SavingsMovement = {
      id: `sm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pocketId: formData.pocketId,
      type: formData.type,
      amountCOP: formData.amountCOP,
      dateISO: formData.dateStr,
      date: dateDMY,
      dateFormattedSpanish,
      notes: formData.notes,
      createdAt: Date.now(),
    };

    const updated = [newMov, ...savingsMovements];
    if (!PocketsStorageService.saveSavingsMovements(updated)) { showToast('No se pudo guardar el movimiento de ahorro.'); return false; }
    setSavingsMovements(updated);

    const pocket = pockets.find((p) => p.id === formData.pocketId);
    showToast(
      `${formData.type === 'deposit' ? 'Aporte de' : 'Retiro de'} ${formatCurrencyCOP(formData.amountCOP)} registrado en "${pocket?.name || 'bolsillo'}".`
    );
    return true;
  };

  const handleTransferSavings = (data: TransferPocketFormData): boolean => {
    if (data.sourcePocketId === data.targetPocketId || !pockets.some(p => p.id === data.sourcePocketId) ||
      !pockets.some(p => p.id === data.targetPocketId) || !Number.isSafeInteger(data.amountCOP) ||
      data.amountCOP <= 0 || calculatePocketCurrentSaved(data.sourcePocketId, savingsMovements) < data.amountCOP) {
      showToast('La transferencia no es válida. Verifica los bolsillos y el saldo de origen.'); return false;
    }
    const dateDMY = parseISOToDMY(data.dateStr);
    const dateFormattedSpanish = formatDateToSpanish(data.dateStr);
    const now = Date.now();

    const outMov: SavingsMovement = {
      id: `sm-out-${now}`,
      pocketId: data.sourcePocketId,
      type: 'transfer_out',
      amountCOP: data.amountCOP,
      dateISO: data.dateStr,
      date: dateDMY,
      dateFormattedSpanish,
      notes: data.notes || 'Transferencia entre bolsillos',
      targetPocketId: data.targetPocketId,
      createdAt: now,
    };

    const inMov: SavingsMovement = {
      id: `sm-in-${now}`,
      pocketId: data.targetPocketId,
      type: 'transfer_in',
      amountCOP: data.amountCOP,
      dateISO: data.dateStr,
      date: dateDMY,
      dateFormattedSpanish,
      notes: data.notes || 'Transferencia entre bolsillos',
      targetPocketId: data.sourcePocketId,
      createdAt: now + 1,
    };

    const updated = [outMov, inMov, ...savingsMovements];
    if (!PocketsStorageService.saveSavingsMovements(updated)) { showToast('No se pudo guardar la transferencia.'); return false; }
    setSavingsMovements(updated);

    const source = pockets.find((p) => p.id === data.sourcePocketId);
    const target = pockets.find((p) => p.id === data.targetPocketId);
    showToast(`Transferencia de ${formatCurrencyCOP(data.amountCOP)} exitosa de "${source?.name}" a "${target?.name}".`);
    return true;
  };

  const handleDeleteSavingsMovement = (movementId: string) => {
    const item = savingsMovements.find(m => m.id === movementId);
    if (!item) return;
    // Nunca eliminar solamente una mitad de una transferencia.
    const counterpart = item.type === 'transfer_in' || item.type === 'transfer_out'
      ? savingsMovements.find(m => m.targetPocketId === item.pocketId && m.pocketId === item.targetPocketId &&
          m.amountCOP === item.amountCOP && m.dateISO === item.dateISO && m.type !== item.type &&
          Math.abs(m.createdAt - item.createdAt) <= 2)
      : undefined;
    if ((item.type === 'transfer_in' || item.type === 'transfer_out') && !counterpart) {
      showToast('No se puede eliminar una transferencia sin localizar su contrapartida.'); return;
    }
    const updated = savingsMovements.filter(m => m.id !== item.id && m.id !== counterpart?.id);
    if (pockets.some(p => calculatePocketCurrentSaved(p.id, updated) < 0)) {
      showToast('No es posible eliminar este aporte: otro movimiento depende de ese saldo.'); return;
    }
    if (!PocketsStorageService.saveSavingsMovements(updated)) { showToast('No se pudo eliminar el ahorro.'); return; }
    setSavingsMovements(updated);
    showToast('Movimiento de ahorro eliminado.');
  };

  const totalReservedCOP = useMemo(() => {
    return pockets.reduce((acc, p) => acc + calculatePocketCurrentSaved(p.id, savingsMovements), 0);
  }, [pockets, savingsMovements]);

  // Solo se descuentan los aportes NETOS del período: no volver a restar ahorros históricos.
  const periodNetSavingsCOP = useMemo(() => savingsMovements
    .filter(m => m.dateISO.startsWith(activePeriod.key) && (m.type === 'deposit' || m.type === 'withdrawal'))
    .reduce((acc, m) => acc + (m.type === 'deposit' ? m.amountCOP : -m.amountCOP), 0), [savingsMovements, activePeriod.key]);
  const freeAvailableBalanceCOP = summary.availableBalanceCOP - periodNetSavingsCOP;

  // Fecha predeterminada para nuevos registros en el período actual
  const todayISO = getTodayISODate();
  const defaultFormDateISO = todayISO.startsWith(activePeriod.key)
    ? todayISO : `${activePeriod.year}-${activePeriod.month.toString().padStart(2, '0')}-15`;

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
        onOpenPockets={() => setIsPocketsOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
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
          onOpenReceipt={() => setIsReceiptOpen(true)}
        />

        {/* D. Progreso del presupuesto (Cálculo corregido sin sumar 101%) */}
        <BudgetProgress summary={summary} />

        {/* D2. Widget Banner de Bolsillos de Ahorro y Metas */}
        <section aria-label="Bolsillos de ahorro y metas" className="mb-6">
          <div className="rounded-[26px] bg-[#16171B] text-white p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-[#E2FE52]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-4 z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#E2FE52] flex items-center justify-center text-[#16171B] shrink-0 shadow-md">
                <PiggyBank className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Bolsillos de Ahorro y Metas
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Dinero reservado: <span className="font-bold text-[#E2FE52] font-mono">{formatCurrencyCOP(totalReservedCOP)}</span> | Dinero libre disponible: <span className="font-bold text-white font-mono">{formatCurrencyCOP(freeAvailableBalanceCOP)}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 z-10 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsPocketsOpen(true)}
                className="w-full md:w-auto px-6 py-3 rounded-full bg-[#E2FE52] hover:bg-lime-400 text-[#16171B] font-extrabold text-xs sm:text-sm shadow-md transition-all duration-200 hover:scale-[1.02] cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <span>Gestionar bolsillos y metas</span>
              </button>
            </div>
          </div>
        </section>

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
        onExportBackup={() => downloadBackup(captureBackup())}
        onImportBackup={async (file) => {
          try {
            if (file.size > 3_000_000) throw new Error('El respaldo no puede superar 3 MB.');
            const backup = validateBackup(JSON.parse(await file.text()));
            if (!window.confirm('¿Restaurar este respaldo? Reemplazará los movimientos, presupuestos y bolsillos actuales.')) return;
            if (!restoreBackup(backup)) throw new Error('No fue posible guardar el respaldo en este navegador.');
            setMovements(backup.finance.movements);
            setBudgets(backup.finance.budgets);
            setActivePeriod(backup.finance.activePeriod);
            setPockets(backup.savings.pockets);
            setSavingsMovements(backup.savings.movements);
            setIsSettingsOpen(false);
            showToast('Copia de seguridad importada correctamente.');
          } catch (error: any) { showToast(`Error al importar respaldo: ${error.message || 'archivo inválido'}`); }
        }}
      />

      {/* MODAL 10: Bolsillos de Ahorro y Metas (Paso 12.1) */}
      <PocketsModal
        isOpen={isPocketsOpen}
        onClose={() => setIsPocketsOpen(false)}
        pockets={pockets}
        savingsMovements={savingsMovements}
        onSavePocket={handleSavePocket}
        onDeletePocket={handleDeletePocket}
        onSaveSavingsMovement={handleSaveSavingsMovement}
        onTransferSavings={handleTransferSavings}
        onDeleteSavingsMovement={handleDeleteSavingsMovement}
        freeAvailableBalanceCOP={freeAvailableBalanceCOP}
      />

      {/* MODAL 11: Digitalización asistida de facturas (Paso 15) */}
      <ReceiptScannerModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        movements={movements}
        onSaveExpense={handleSaveExpense}
        onOpenManualExpense={() => setIsNewExpenseOpen(true)}
      />

      {/* MODAL 12: Asistente Financiero Inteligente con Gemini y voz */}
      <AsistenteFinancieroModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        activePeriod={activePeriod}
        summary={summary}
        movements={movements}
        pockets={pockets}
        savingsMovements={savingsMovements}
        onExecuteExpense={handleSaveExpense}
        onExecuteIncome={handleSaveIncome}
        onExecutePocketContribution={handleSaveSavingsMovement}
        onExecutePocketWithdrawal={handleSaveSavingsMovement}
        onExecuteTransfer={handleTransferSavings}
        onOpenReceipt={() => { setIsAssistantOpen(false); setIsReceiptOpen(true); }}
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
