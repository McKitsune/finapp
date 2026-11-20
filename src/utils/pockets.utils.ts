/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SavingsPocket,
  SavingsMovement,
  PocketFinancialSummary,
  PocketStatus,
} from '../types/pockets.types';
import { parseDMYDate } from './finance.utils';

/**
 * Calcula el saldo actual ahorrado (aportes + transfer_in - retiros - transfer_out) para un bolsillo.
 */
export function calculatePocketCurrentSaved(
  pocketId: string,
  movements: SavingsMovement[]
): number {
  const pocketMoves = movements.filter((m) => m.pocketId === pocketId);
  return pocketMoves.reduce((accum, m) => {
    if (m.type === 'deposit' || m.type === 'transfer_in') {
      return accum + m.amountCOP;
    }
    if (m.type === 'withdrawal' || m.type === 'transfer_out') {
      return accum - m.amountCOP;
    }
    return accum;
  }, 0);
}

/**
 * Calcula el ahorro esperado acumulado hasta la fecha actual (o una fecha de referencia).
 */
export function calculateExpectedSaved(
  pocket: SavingsPocket,
  referenceDate: Date = new Date()
): { expectedSaved: number; totalPeriods: number; elapsedPeriods: number } {
  const start = new Date(pocket.startDateISO);
  const target = new Date(pocket.targetDateISO);

  if (isNaN(start.getTime()) || isNaN(target.getTime()) || start >= target) {
    return { expectedSaved: 0, totalPeriods: 1, elapsedPeriods: 0 };
  }

  const diffDaysTotal = Math.max(1, Math.ceil((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const diffDaysElapsed = Math.max(0, Math.ceil((referenceDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  let periodDays = 30; // monthly default
  if (pocket.frequency === 'weekly') periodDays = 7;
  if (pocket.frequency === 'biweekly') periodDays = 14;

  const totalPeriods = Math.max(1, Math.ceil(diffDaysTotal / periodDays));
  const elapsedPeriods = Math.min(totalPeriods, Math.max(0, Math.floor(diffDaysElapsed / periodDays)));

  const expectedSaved = elapsedPeriods * pocket.plannedPeriodicAmountCOP;
  return { expectedSaved, totalPeriods, elapsedPeriods };
}

/**
 * Determina el estado del bolsillo según el ahorro real vs esperado.
 */
export function determinePocketStatus(
  currentSaved: number,
  targetAmount: number,
  expectedSaved: number,
  hasSchedule: boolean
): { status: PocketStatus; statusLabel: string; badgeColorClass: string } {
  if (currentSaved >= targetAmount) {
    return {
      status: 'completed',
      statusLabel: 'Completado',
      badgeColorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  }

  if (!hasSchedule) {
    return {
      status: 'unplanned',
      statusLabel: 'Sin cronograma',
      badgeColorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  }

  // Tolerancia del 5% o comparación directa
  const tolerance = Math.max(10000, expectedSaved * 0.05);

  if (currentSaved > expectedSaved + tolerance) {
    return {
      status: 'ahead',
      statusLabel: 'Adelantado',
      badgeColorClass: 'bg-[#E2FE52] text-[#16171B] border-lime-300 font-bold',
    };
  }

  if (currentSaved >= expectedSaved - tolerance) {
    return {
      status: 'on_track',
      statusLabel: 'Al día',
      badgeColorClass: 'bg-blue-50 text-blue-800 border-blue-200',
    };
  }

  return {
    status: 'behind',
    statusLabel: 'Atrasado',
    badgeColorClass: 'bg-rose-50 text-rose-800 border-rose-200',
  };
}

/**
 * Calcula el resumen financiero completo para un bolsillo.
 */
export function calculatePocketSummary(
  pocket: SavingsPocket,
  movements: SavingsMovement[]
): PocketFinancialSummary {
  const currentSavedCOP = calculatePocketCurrentSaved(pocket.id, movements);
  const targetAmountCOP = pocket.targetAmountCOP;
  const remainingCOP = Math.max(0, targetAmountCOP - currentSavedCOP);
  const progressPercentage = targetAmountCOP > 0 ? Math.min(100, (currentSavedCOP / targetAmountCOP) * 100) : 0;

  const hasSchedule = Boolean(pocket.startDateISO && pocket.targetDateISO);
  const { expectedSaved, totalPeriods, elapsedPeriods } = calculateExpectedSaved(pocket);

  const differenceCOP = currentSavedCOP - expectedSaved;
  const compliancePercentage = expectedSaved > 0 ? Math.round((currentSavedCOP / expectedSaved) * 100) : (currentSavedCOP > 0 ? 100 : 0);

  const { status, statusLabel, badgeColorClass } = determinePocketStatus(currentSavedCOP, targetAmountCOP, expectedSaved, hasSchedule);

  const remainingPeriods = Math.max(1, totalPeriods - elapsedPeriods);
  const requiredPeriodicAmountCOP = remainingCOP > 0 ? Math.ceil(remainingCOP / remainingPeriods) : 0;

  // Fecha estimada de cumplimiento basada en el ritmo de ahorro real
  let estimatedCompletionDateStr: string | undefined = undefined;
  if (currentSavedCOP > 0 && elapsedPeriods > 0) {
    const avgPerPeriod = currentSavedCOP / elapsedPeriods;
    if (avgPerPeriod > 0) {
      const periodsNeeded = Math.ceil(remainingCOP / avgPerPeriod);
      let periodDays = 30;
      if (pocket.frequency === 'weekly') periodDays = 7;
      if (pocket.frequency === 'biweekly') periodDays = 14;

      const estDays = periodsNeeded * periodDays;
      const estDate = new Date();
      estDate.setDate(estDate.getDate() + estDays);
      estimatedCompletionDateStr = estDate.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }

  return {
    pocketId: pocket.id,
    targetAmountCOP,
    currentSavedCOP,
    remainingCOP,
    progressPercentage,
    expectedSavedCOP: expectedSaved,
    differenceCOP,
    compliancePercentage,
    status,
    statusLabel,
    badgeColorClass,
    remainingPeriods,
    requiredPeriodicAmountCOP,
    estimatedCompletionDateStr,
  };
}

/**
 * Genera datos para la gráfica de barras agrupadas y línea de progreso acumulado de un bolsillo.
 */
export function calculatePocketChartData(
  pocket: SavingsPocket,
  movements: SavingsMovement[]
): {
  barChartData: Array<{ periodLabel: string; targetAmount: number; realAmount: number; difference: number }>;
  lineChartData: Array<{ dateLabel: string; expectedAccumulated: number; realAccumulated: number }>;
} {
  const pocketMoves = movements
    .filter((m) => m.pocketId === pocket.id)
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime());

  // Generar acumulados a lo largo del tiempo para la gráfica de línea
  let runningReal = 0;
  const lineChartData: Array<{ dateLabel: string; expectedAccumulated: number; realAccumulated: number }> = [];

  const start = new Date(pocket.startDateISO);
  const target = new Date(pocket.targetDateISO);
  const totalDays = Math.max(1, (target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  // Puntos de muestreo temporales (ej. cada mes o cada movimiento)
  const datesSet = new Set<string>();
  datesSet.add(pocket.startDateISO);
  pocketMoves.forEach((m) => datesSet.add(m.dateISO));
  datesSet.add(pocket.targetDateISO);

  const sortedDates = Array.from(datesSet).sort();

  let accumulatedExpected = 0;
  const { totalPeriods } = calculateExpectedSaved(pocket, target);
  const plannedPerPeriod = pocket.plannedPeriodicAmountCOP;

  sortedDates.forEach((dateStr, idx) => {
    const d = new Date(dateStr);
    const { expectedSaved } = calculateExpectedSaved(pocket, d);

    // Sumar movimientos hasta esta fecha
    runningReal = pocketMoves
      .filter((m) => m.dateISO <= dateStr)
      .reduce((acc, m) => {
        if (m.type === 'deposit' || m.type === 'transfer_in') return acc + m.amountCOP;
        if (m.type === 'withdrawal' || m.type === 'transfer_out') return acc - m.amountCOP;
        return acc;
      }, 0);

    const label = d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });
    lineChartData.push({
      dateLabel: label,
      expectedAccumulated: expectedSaved,
      realAccumulated: runningReal,
    });
  });

  // Calendario completo por mes. Incluye meses con ahorro real cero para visualizar el incumplimiento.
  const barMap = new Map<string, { target: number; real: number }>();
  const todayISO = new Date().toISOString().slice(0, 10);
  const periodEndISO = pocket.targetDateISO < todayISO ? pocket.targetDateISO : todayISO;
  if (pocket.startDateISO <= periodEndISO) {
    const firstMonth = new Date(`${pocket.startDateISO.slice(0, 7)}-01T12:00:00Z`);
    const lastMonth = new Date(`${periodEndISO.slice(0, 7)}-01T12:00:00Z`);
    for (let date = new Date(firstMonth), i = 0; date <= lastMonth && i < 120; date.setUTCMonth(date.getUTCMonth() + 1), i++) {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      const endThisMonth = new Date(Date.UTC(year, month + 1, 0, 12));
      const endPrevMonth = new Date(Date.UTC(year, month, 0, 12));
      const expectedThis = calculateExpectedSaved(pocket, endThisMonth).expectedSaved;
      const expectedPrev = calculateExpectedSaved(pocket, endPrevMonth).expectedSaved;
      barMap.set(key, { target: Math.max(0, expectedThis - expectedPrev), real: 0 });
    }
  }
  pocketMoves.forEach((m) => {
    const monthKey = m.dateISO.substring(0, 7);
    const current = barMap.get(monthKey) || { target: 0, real: 0 };
    if (m.type === 'deposit' || m.type === 'transfer_in') current.real += m.amountCOP;
    else if (m.type === 'withdrawal' || m.type === 'transfer_out') current.real -= m.amountCOP;
    barMap.set(monthKey, current);
  });

  const barChartData = Array.from(barMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([monthKey, val]) => {
    const [y, m] = monthKey.split('-');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthName = monthNames[parseInt(m, 10) - 1] || m;
    return {
      periodLabel: `${monthName} ${y}`,
      targetAmount: val.target,
      realAmount: Math.max(0, val.real),
      difference: Math.max(0, val.real) - val.target,
    };
  });

  return { barChartData, lineChartData };
}
