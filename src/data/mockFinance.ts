/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyChartBar, FinanceMovement, PeriodIdentifier } from '../types/finance.types';

export const DEFAULT_PERIOD: PeriodIdentifier = {
  key: '2025-07',
  month: 7,
  year: 2025,
  label: 'Julio 2025',
};

export const DEFAULT_BUDGET_COP = 3500000;

/**
 * Movimientos y gastos iniciales correspondientes a Julio de 2025.
 * Las primeras 5 transacciones coinciden con el mockup aprobado.
 * Suma de gastos de julio: $1.298.500 COP.
 */
export const INITIAL_MOCK_MOVEMENTS: FinanceMovement[] = [
  {
    id: 'exp-01',
    type: 'expense',
    date: '16/07/2025',
    dateISO: '2025-07-16',
    dateFormattedSpanish: '16 de julio de 2025',
    description: 'Alimentación',
    category: 'Alimentación',
    amountCOP: 148500,
    createdAt: 1752670000000,
  },
  {
    id: 'exp-02',
    type: 'expense',
    date: '15/07/2025',
    dateISO: '2025-07-15',
    dateFormattedSpanish: '15 de julio de 2025',
    description: 'Transporte',
    category: 'Transporte',
    amountCOP: 32000,
    createdAt: 1752580000000,
  },
  {
    id: 'exp-03',
    type: 'expense',
    date: '14/07/2025',
    dateISO: '2025-07-14',
    dateFormattedSpanish: '14 de julio de 2025',
    description: 'Servicios públicos',
    category: 'Servicios públicos',
    amountCOP: 259000,
    createdAt: 1752490000000,
  },
  {
    id: 'exp-04',
    type: 'expense',
    date: '12/07/2025',
    dateISO: '2025-07-12',
    dateFormattedSpanish: '12 de julio de 2025',
    description: 'Ropa y compras personales',
    category: 'Ropa y compras personales',
    amountCOP: 189000,
    createdAt: 1752320000000,
  },
  {
    id: 'exp-05',
    type: 'expense',
    date: '11/07/2025',
    dateISO: '2025-07-11',
    dateFormattedSpanish: '11 de julio de 2025',
    description: 'Entretenimiento y ocio',
    category: 'Entretenimiento y ocio',
    amountCOP: 67000,
    createdAt: 1752230000000,
  },
  {
    id: 'exp-06',
    type: 'expense',
    date: '10/07/2025',
    dateISO: '2025-07-10',
    dateFormattedSpanish: '10 de julio de 2025',
    description: 'Compras del hogar',
    category: 'Alimentación',
    amountCOP: 150000,
    createdAt: 1752150000000,
  },
  {
    id: 'exp-07',
    type: 'expense',
    date: '08/07/2025',
    dateISO: '2025-07-08',
    dateFormattedSpanish: '08 de julio de 2025',
    description: 'Transporte urbano',
    category: 'Transporte',
    amountCOP: 98000,
    createdAt: 1751970000000,
  },
  {
    id: 'exp-08',
    type: 'expense',
    date: '06/07/2025',
    dateISO: '2025-07-06',
    dateFormattedSpanish: '06 de julio de 2025',
    description: 'Energía y acueducto',
    category: 'Servicios públicos',
    amountCOP: 115000,
    createdAt: 1751800000000,
  },
  {
    id: 'exp-09',
    type: 'expense',
    date: '04/07/2025',
    dateISO: '2025-07-04',
    dateFormattedSpanish: '04 de julio de 2025',
    description: 'Calzado y accesorios',
    category: 'Ropa y compras personales',
    amountCOP: 130000,
    createdAt: 1751630000000,
  },
  {
    id: 'exp-10',
    type: 'expense',
    date: '02/07/2025',
    dateISO: '2025-07-02',
    dateFormattedSpanish: '02 de julio de 2025',
    description: 'Restaurante y cine',
    category: 'Entretenimiento y ocio',
    amountCOP: 110000,
    createdAt: 1751450000000,
  },
];

// Alias para compatibilidad con código preexistente
export const MOCK_EXPENSES = INITIAL_MOCK_MOVEMENTS;

export const MONTHLY_BUDGET_CONFIG = {
  periodLabel: DEFAULT_PERIOD.label,
  month: DEFAULT_PERIOD.month,
  year: DEFAULT_PERIOD.year,
  budgetCOP: DEFAULT_BUDGET_COP,
};

export const MOCK_CHART_BARS: DailyChartBar[] = [
  {
    dayId: 'day-10',
    dayNumber: 10,
    dayLabel: '10 jul',
    fullDateLabel: '10 de julio de 2025',
    totalAmountCOP: 150000,
    lowerSegmentCOP: 75000,
    upperSegmentCOP: 75000,
    expenseCount: 1,
  },
  {
    dayId: 'day-11',
    dayNumber: 11,
    dayLabel: '11 jul',
    fullDateLabel: '11 de julio de 2025',
    totalAmountCOP: 75000,
    lowerSegmentCOP: 50000,
    upperSegmentCOP: 25000,
    expenseCount: 1,
  },
  {
    dayId: 'day-12',
    dayNumber: 12,
    dayLabel: '12 jul',
    fullDateLabel: '12 de julio de 2025',
    totalAmountCOP: 225000,
    lowerSegmentCOP: 85000,
    upperSegmentCOP: 140000,
    expenseCount: 1,
  },
  {
    dayId: 'day-13',
    dayNumber: 13,
    dayLabel: '13 jul',
    fullDateLabel: '13 de julio de 2025',
    totalAmountCOP: 120000,
    lowerSegmentCOP: 40000,
    upperSegmentCOP: 80000,
    expenseCount: 1,
  },
  {
    dayId: 'day-14',
    dayNumber: 14,
    dayLabel: '14 jul',
    fullDateLabel: '14 de julio de 2025',
    totalAmountCOP: 275000,
    lowerSegmentCOP: 135000,
    upperSegmentCOP: 140000,
    expenseCount: 1,
  },
  {
    dayId: 'day-15',
    dayNumber: 15,
    dayLabel: '15 jul',
    fullDateLabel: '15 de julio de 2025',
    totalAmountCOP: 160000,
    lowerSegmentCOP: 75000,
    upperSegmentCOP: 85000,
    expenseCount: 1,
  },
  {
    dayId: 'day-16',
    dayNumber: 16,
    dayLabel: '16 jul',
    fullDateLabel: '16 de julio de 2025',
    totalAmountCOP: 95000,
    lowerSegmentCOP: 35000,
    upperSegmentCOP: 60000,
    expenseCount: 1,
  },
];
