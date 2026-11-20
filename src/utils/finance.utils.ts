/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DailyChartBar,
  FinanceMovement,
  FinancialSummary,
  PeriodIdentifier,
} from '../types/finance.types';

const MONTH_NAMES_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

/**
 * Formatea un monto a la convención monetaria colombiana (COP).
 * Ejemplo: 3500000 -> "$3.500.000 COP", con opción de signo + o -.
 */
export function formatCurrencyCOP(
  amount: number,
  options?: { showSign?: boolean; showCOP?: boolean; isExpense?: boolean }
): string {
  const { showSign = false, showCOP = true, isExpense = false } = options || {};
  const isNegative = amount < 0;
  const absAmount = Math.round(Math.abs(amount));

  const formattedNumber = absAmount
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  const suffix = showCOP ? ' COP' : '';

  if (isNegative) {
    return `-$${formattedNumber}${suffix}`;
  }

  if (isExpense) {
    return `-$${formattedNumber}${suffix}`;
  }

  if (showSign && amount > 0) {
    return `+$${formattedNumber}${suffix}`;
  }

  return `$${formattedNumber}${suffix}`;
}

/**
 * Parsea una fecha en formato "DD/MM/YYYY" a un objeto Date nativo.
 */
export function parseDMYDate(dateStr: string): Date {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month - 1, day);
  }
  return new Date();
}

/**
 * Convierte una fecha ISO "YYYY-MM-DD" al formato estándar "DD/MM/YYYY".
 */
export function parseISOToDMY(isoStr: string): string {
  if (!isoStr) return '';
  const [year, month, day] = isoStr.split('-');
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

/**
 * Convierte un formato "DD/MM/YYYY" a ISO "YYYY-MM-DD".
 */
export function parseDMYToISO(dmyStr: string): string {
  if (!dmyStr) return '';
  const [day, month, year] = dmyStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Extrae el identificador de período (PeriodIdentifier) a partir de una fecha ISO o DMY.
 */
export function getPeriodFromDate(dateStr: string): PeriodIdentifier {
  let year = 2025;
  let month = 7;

  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
  } else if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  }

  const monthName = MONTH_NAMES_ES[month - 1] || 'Mes';
  const key = `${year}-${month.toString().padStart(2, '0')}`;
  const label = `${monthName} ${year}`;

  return { year, month, key, label };
}

/**
 * Formatea una fecha a español completo: ej. "16 de julio de 2025".
 */
export function formatDateToSpanish(dateInput: Date | string): string {
  let d: Date;
  if (typeof dateInput === 'string') {
    if (dateInput.includes('/')) {
      d = parseDMYDate(dateInput);
    } else if (dateInput.includes('-')) {
      const [year, month, day] = dateInput.split('-').map(Number);
      d = new Date(year, month - 1, day);
    } else {
      d = new Date(dateInput);
    }
  } else {
    d = dateInput;
  }

  if (isNaN(d.getTime())) return dateInput.toString();

  const day = d.getDate();
  const monthName = MONTH_NAMES_ES[d.getMonth()]?.toLowerCase() || '';
  const year = d.getFullYear();

  return `${day} de ${monthName} de ${year}`;
}

/**
 * Obtiene la fecha actual en formato ISO "YYYY-MM-DD".
 */
export function getTodayISODate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Filtra los movimientos que pertenecen a un período ('YYYY-MM') y los ordena del más reciente al más antiguo.
 */
export function filterMovementsByPeriod(
  movements: FinanceMovement[],
  periodKey: string
): FinanceMovement[] {
  return movements
    .filter((m) => {
      if (m.dateISO) {
        return m.dateISO.startsWith(periodKey);
      }
      const period = getPeriodFromDate(m.date);
      return period.key === periodKey;
    })
    .sort((a, b) => {
      const dateA = a.dateISO ? new Date(a.dateISO).getTime() : parseDMYDate(a.date).getTime();
      const dateB = b.dateISO ? new Date(b.dateISO).getTime() : parseDMYDate(b.date).getTime();
      if (dateB !== dateA) {
        return dateB - dateA;
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
}

/**
 * Realiza los cálculos financieros exactos a partir de la regla de negocio corregida:
 * Capacidad mensual = Presupuesto base + Ingresos adicionales
 * Saldo disponible = Capacidad mensual − Gastos registrados
 * Porcentaje gastado = (Gastos / Capacidad mensual) × 100
 * Porcentaje disponible = 100 − Porcentaje gastado (Garantizando suma exacta del 100%)
 */
export function calculateFinancialSummary(
  budgetCOP: number,
  periodMovements: FinanceMovement[]
): FinancialSummary {
  // Total de gastos registrados en el período
  const totalExpensesCOP = periodMovements
    .filter((m) => m.type === 'expense')
    .reduce((accum, curr) => accum + curr.amountCOP, 0);

  // Total de ingresos adicionales registrados en el período
  const additionalIncomeCOP = periodMovements
    .filter((m) => m.type === 'income')
    .reduce((accum, curr) => accum + curr.amountCOP, 0);

  // Capacidad mensual total
  const totalCapacityCOP = Math.max(0, budgetCOP + additionalIncomeCOP);

  // Saldo disponible
  const availableBalanceCOP = totalCapacityCOP - totalExpensesCOP;
  const isDeficit = availableBalanceCOP < 0;

  let spentPercentage = 0;
  let availablePercentage = 0;
  let spentPercentageInt = 0;
  let availablePercentageInt = 0;

  if (totalCapacityCOP > 0) {
    const rawSpentPct = (totalExpensesCOP / totalCapacityCOP) * 100;
    spentPercentage = Math.round(rawSpentPct * 10) / 10;
    spentPercentageInt = Math.round(rawSpentPct);

    if (isDeficit) {
      availablePercentage = 0;
      availablePercentageInt = 0;
    } else {
      // Regla obligatoria: Porcentaje disponible = 100 − Porcentaje gastado
      // Garantiza suma exacta sin discrepancias de redondeo como 41% + 60% = 101%
      availablePercentage = Math.max(0, Math.round((100 - spentPercentage) * 10) / 10);
      availablePercentageInt = Math.max(0, 100 - spentPercentageInt);
    }
  }

  // Llenado gráfico limitado al 100%
  const graphicalSpentPercentage = Math.min(100, Math.max(0, spentPercentageInt));
  const graphicalAvailablePercentage = isDeficit
    ? 0
    : Math.max(0, 100 - graphicalSpentPercentage);

  return {
    budgetCOP,
    additionalIncomeCOP,
    totalCapacityCOP,
    totalExpensesCOP,
    availableBalanceCOP,
    spentPercentage,
    availablePercentage,
    spentPercentageInt,
    availablePercentageInt,
    isDeficit,
    graphicalSpentPercentage,
    graphicalAvailablePercentage,
  };
}

/**
 * Agrupa automáticamente los gastos del mes para la gráfica de comportamiento diario.
 * Solo considera movimientos de tipo 'expense'. Suma múltiples gastos en el mismo día.
 */
export function calculateDailyChartBars(
  periodMovements: FinanceMovement[],
  period: PeriodIdentifier
): DailyChartBar[] {
  const expenseMovements = periodMovements.filter((m) => m.type === 'expense');

  // Si estamos en Julio 2025, aseguramos la ventana visual de los días 10 al 16 jul
  // e incorporamos cualquier otro día con gastos en ese mes.
  const daysMap = new Map<number, { total: number; count: number }>();

  if (period.key === '2025-07') {
    // Días del mockup base
    [10, 11, 12, 13, 14, 15, 16].forEach((day) => {
      daysMap.set(day, { total: 0, count: 0 });
    });
  } else {
    // Para otros meses, inicializar días con gastos o rango de muestra
    [1, 5, 10, 15, 20, 25].forEach((day) => {
      daysMap.set(day, { total: 0, count: 0 });
    });
  }

  // Acumular todos los gastos reales en sus respectivos días
  expenseMovements.forEach((exp) => {
    let dayNum = 1;
    if (exp.dateISO) {
      dayNum = parseInt(exp.dateISO.split('-')[2], 10);
    } else if (exp.date) {
      dayNum = parseInt(exp.date.split('/')[0], 10);
    }

    if (!isNaN(dayNum)) {
      const current = daysMap.get(dayNum) || { total: 0, count: 0 };
      current.total += exp.amountCOP;
      current.count += 1;
      daysMap.set(dayNum, current);
    }
  });

  // Ordenar días numéricamente
  const sortedDays = Array.from(daysMap.keys()).sort((a, b) => a - b);
  const monthShort = (MONTH_NAMES_ES[period.month - 1] || 'mes').toLowerCase().slice(0, 3);

  return sortedDays.map((dayNum) => {
    const data = daysMap.get(dayNum)!;
    const total = data.total;

    // Segmentos estilísticos consistentes: mitad inferior lima, mitad superior carbón
    const lower = total > 0 ? Math.round(total * 0.48) : 0;
    const upper = total > 0 ? total - lower : 0;

    return {
      dayId: `day-${dayNum}`,
      dayNumber: dayNum,
      dayLabel: `${dayNum} ${monthShort}`,
      fullDateLabel: `${dayNum} de ${MONTH_NAMES_ES[period.month - 1]?.toLowerCase()} de ${period.year}`,
      totalAmountCOP: total,
      lowerSegmentCOP: lower,
      upperSegmentCOP: upper,
      expenseCount: data.count,
    };
  });
}
