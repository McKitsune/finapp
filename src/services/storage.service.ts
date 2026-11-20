/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FinanceMovement, PeriodIdentifier } from '../types/finance.types';
import { INITIAL_MOCK_MOVEMENTS, DEFAULT_PERIOD, DEFAULT_BUDGET_COP } from '../data/mockFinance';

const STORAGE_KEYS = {
  MOVEMENTS: 'mi_presupuesto_movements_v2',
  BUDGETS: 'mi_presupuesto_budgets_v2',
  ACTIVE_PERIOD: 'mi_presupuesto_active_period_v2',
};

/**
 * Capa de persistencia local mediante localStorage.
 * Maneja datos corruptos, excepciones de almacenamiento y persistencia de movimientos y presupuestos.
 */
export const StorageService = {
  /**
   * Carga la lista completa de movimientos.
   * Si no existen registros en localStorage, siembra los datos iniciales.
   */
  loadMovements(): FinanceMovement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      if (!data) {
        // Primera ejecución: inicializar con datos de demostración
        this.saveMovements(INITIAL_MOCK_MOVEMENTS);
        return INITIAL_MOCK_MOVEMENTS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return INITIAL_MOCK_MOVEMENTS;
    } catch (error) {
      console.warn('Error al leer movimientos de localStorage, usando valores iniciales:', error);
      return INITIAL_MOCK_MOVEMENTS;
    }
  },

  /**
   * Guarda la colección de movimientos en localStorage.
   */
  saveMovements(movements: FinanceMovement[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
      return true;
    } catch (error) {
      console.error('Error al persistir movimientos en localStorage:', error);
      return false;
    }
  },

  /**
   * Carga el mapa de presupuestos por mes ('YYYY-MM' -> monto en COP).
   */
  loadBudgets(): Record<string, number> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (!data) {
        const initialBudgets: Record<string, number> = {
          [DEFAULT_PERIOD.key]: DEFAULT_BUDGET_COP,
        };
        this.saveBudgets(initialBudgets);
        return initialBudgets;
      }
      const parsed = JSON.parse(data);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
      return { [DEFAULT_PERIOD.key]: DEFAULT_BUDGET_COP };
    } catch (error) {
      console.warn('Error al leer presupuestos de localStorage:', error);
      return { [DEFAULT_PERIOD.key]: DEFAULT_BUDGET_COP };
    }
  },

  /**
   * Guarda el mapa de presupuestos por período.
   */
  saveBudgets(budgets: Record<string, number>): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      return true;
    } catch (error) {
      console.error('Error al persistir presupuestos en localStorage:', error);
      return false;
    }
  },

  /**
   * Actualiza o crea el presupuesto de un mes específico.
   */
  setBudgetForPeriod(periodKey: string, amountCOP: number): Record<string, number> {
    const budgets = this.loadBudgets();
    budgets[periodKey] = amountCOP;
    this.saveBudgets(budgets);
    return budgets;
  },

  /**
   * Carga el período activo guardado o el período por defecto.
   */
  loadActivePeriod(): PeriodIdentifier {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_PERIOD);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.key && parsed.year && parsed.month && parsed.label) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error al cargar período activo, usando por defecto:', e);
    }
    return DEFAULT_PERIOD;
  },

  /**
   * Guarda el período seleccionado.
   */
  saveActivePeriod(period: PeriodIdentifier): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PERIOD, JSON.stringify(period));
    } catch (e) {
      console.error('Error al guardar período activo:', e);
    }
  },
};
