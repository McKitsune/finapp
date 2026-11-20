/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavingsPocket, SavingsMovement } from '../types/pockets.types';
import { INITIAL_MOCK_POCKETS, INITIAL_MOCK_SAVINGS_MOVEMENTS } from '../data/mockPockets';

const POCKETS_STORAGE_KEYS = {
  POCKETS: 'mi_presupuesto_pockets_v1',
  SAVINGS_MOVEMENTS: 'mi_presupuesto_savings_movements_v1',
};

export const PocketsStorageService = {
  loadPockets(): SavingsPocket[] {
    try {
      const data = localStorage.getItem(POCKETS_STORAGE_KEYS.POCKETS);
      if (!data) {
        this.savePockets(INITIAL_MOCK_POCKETS);
        return INITIAL_MOCK_POCKETS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
      return INITIAL_MOCK_POCKETS;
    } catch (e) {
      console.warn('Error al cargar bolsillos de ahorro:', e);
      return INITIAL_MOCK_POCKETS;
    }
  },

  savePockets(pockets: SavingsPocket[]): boolean {
    try {
      localStorage.setItem(POCKETS_STORAGE_KEYS.POCKETS, JSON.stringify(pockets));
      return true;
    } catch (e) {
      console.error('Error al guardar bolsillos:', e);
      return false;
    }
  },

  loadSavingsMovements(): SavingsMovement[] {
    try {
      const data = localStorage.getItem(POCKETS_STORAGE_KEYS.SAVINGS_MOVEMENTS);
      if (!data) {
        this.saveSavingsMovements(INITIAL_MOCK_SAVINGS_MOVEMENTS);
        return INITIAL_MOCK_SAVINGS_MOVEMENTS;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
      return INITIAL_MOCK_SAVINGS_MOVEMENTS;
    } catch (e) {
      console.warn('Error al cargar movimientos de ahorro:', e);
      return INITIAL_MOCK_SAVINGS_MOVEMENTS;
    }
  },

  saveSavingsMovements(movements: SavingsMovement[]): boolean {
    try {
      localStorage.setItem(POCKETS_STORAGE_KEYS.SAVINGS_MOVEMENTS, JSON.stringify(movements));
      return true;
    } catch (e) {
      console.error('Error al guardar movimientos de ahorro:', e);
      return false;
    }
  },
};
