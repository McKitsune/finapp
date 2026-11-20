/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ReceiptDetail } from './receipts.types';

export type MovementType = 'expense' | 'income';

export type ExpenseCategory =
  | 'Alimentación'
  | 'Transporte'
  | 'Servicios públicos'
  | 'Ropa y compras personales'
  | 'Entretenimiento y ocio'
  | 'Salud'
  | 'Educación'
  | 'Hogar'
  | 'Otros';

export type IncomeCategory =
  | 'Salario'
  | 'Trabajo independiente'
  | 'Negocio'
  | 'Bonificación'
  | 'Regalo'
  | 'Reembolso'
  | 'Otros';

export interface FinanceMovement {
  id: string;
  type: MovementType;
  date: string; // Formato DD/MM/YYYY
  dateISO: string; // Formato YYYY-MM-DD
  dateFormattedSpanish: string; // ej: '16 de julio de 2025'
  description: string;
  category: ExpenseCategory | IncomeCategory;
  amountCOP: number;
  notes?: string;
  paymentMethod?: string; // Para ingresos (ej. Transferencia, Efectivo)
  receipt?: ReceiptDetail; // Detalle opcional de factura, sin duplicar el gasto.
  createdAt: number; // Timestamp para desempates cronológicos
}

// Mantener compatibilidad de alias
export type ExpenseItem = FinanceMovement;

export interface NewExpenseFormData {
  receipt?: ReceiptDetail;
  amountCOP: number;
  description: string;
  category: ExpenseCategory;
  dateStr: string; // YYYY-MM-DD
  notes?: string;
}

export interface NewIncomeFormData {
  amountCOP: number;
  description: string;
  category: IncomeCategory;
  dateStr: string; // YYYY-MM-DD
  paymentMethod?: string;
  notes?: string;
}

export interface EditMovementFormData {
  id: string;
  type: MovementType;
  amountCOP: number;
  description: string;
  category: ExpenseCategory | IncomeCategory;
  dateStr: string; // YYYY-MM-DD
  paymentMethod?: string;
  notes?: string;
}

export interface PeriodIdentifier {
  year: number;
  month: number; // 1-12
  key: string; // 'YYYY-MM' ej. '2025-07'
  label: string; // 'Julio 2025'
}

export interface FinancialSummary {
  budgetCOP: number; // Presupuesto base del mes
  additionalIncomeCOP: number; // Ingresos adicionales registrados en el mes
  totalCapacityCOP: number; // Capacidad mensual = Presupuesto base + Ingresos adicionales
  totalExpensesCOP: number; // Gastos totales del mes
  availableBalanceCOP: number; // Disponible = Capacidad mensual - Gastos
  spentPercentage: number; // Porcentaje gastado con precisión
  availablePercentage: number; // Porcentaje disponible (100 - gastado)
  spentPercentageInt: number; // Entero redondeado
  availablePercentageInt: number; // Entero garantizado para sumar exactamente 100
  isDeficit: boolean;
  graphicalSpentPercentage: number; // Limitado visualmente al 100%
  graphicalAvailablePercentage: number;
}

export interface DailyChartBar {
  dayId: string;
  dayNumber: number;
  dayLabel: string; // '10 jul', '14 jul'
  fullDateLabel: string; // '14 de julio de 2025'
  totalAmountCOP: number;
  lowerSegmentCOP: number; // Segmento inferior decorativo lima
  upperSegmentCOP: number; // Segmento superior decorativo carbón
  expenseCount: number;
}
