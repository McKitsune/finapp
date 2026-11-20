/** Exportación e importación local. No transmite información a ningún servidor. */
import { StorageService } from './storage.service';
import { PocketsStorageService } from './pocketsStorage.service';
import type { FinanceMovement, PeriodIdentifier } from '../types/finance.types';
import type { SavingsMovement, SavingsPocket } from '../types/pockets.types';

export interface AppBackup {
  version: 1;
  exportedAt: string;
  finance: { movements: FinanceMovement[]; budgets: Record<string, number>; activePeriod: PeriodIdentifier };
  savings: { pockets: SavingsPocket[]; movements: SavingsMovement[] };
}
export function captureBackup(): AppBackup {
  return {
    version: 1, exportedAt: new Date().toISOString(),
    finance: { movements: StorageService.loadMovements(), budgets: StorageService.loadBudgets(), activePeriod: StorageService.loadActivePeriod() },
    savings: { pockets: PocketsStorageService.loadPockets(), movements: PocketsStorageService.loadSavingsMovements() },
  };
}
function validAmount(v: unknown) { return Number.isSafeInteger(v) && Number(v) >= 0; }
function validDate(v: unknown): boolean {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + 'T12:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === v;
}
export function validateBackup(data: unknown): AppBackup {
  if (!data || typeof data !== 'object') throw new Error('El archivo no contiene un respaldo válido.');
  const b = data as AppBackup;
  if (b.version !== 1 || !b.finance || !b.savings || !Array.isArray(b.finance.movements) || !Array.isArray(b.savings.pockets) || !Array.isArray(b.savings.movements)) {
    throw new Error('El archivo no tiene la estructura de respaldo compatible con esta versión.');
  }
  if (b.finance.movements.length > 15000 || b.savings.movements.length > 15000 || b.savings.pockets.length > 500) throw new Error('El respaldo supera los límites admitidos.');
  const ids = new Set<string>();
  for (const m of b.finance.movements) {
    if (!m || typeof m.id !== 'string' || ids.has(m.id) || !['expense','income'].includes(m.type) || !validAmount(m.amountCOP) || !validDate(m.dateISO) || typeof m.description !== 'string' || m.description.length > 2000) {
      throw new Error('El respaldo contiene movimientos financieros inconsistentes.');
    }
    ids.add(m.id);
  }
  ids.clear();
  for (const p of b.savings.pockets) {
    if (!p || typeof p.id !== 'string' || ids.has(p.id) || typeof p.name !== 'string' || !validAmount(p.targetAmountCOP) || !validDate(p.startDateISO) || !validDate(p.targetDateISO)) throw new Error('El respaldo contiene bolsillos inválidos.');
    ids.add(p.id);
  }
  const pocketIds = new Set(ids); ids.clear();
  for (const m of b.savings.movements) {
    if (!m || typeof m.id !== 'string' || ids.has(m.id) || !pocketIds.has(m.pocketId) || !validAmount(m.amountCOP) || !validDate(m.dateISO) || !['deposit','withdrawal','transfer_in','transfer_out'].includes(m.type)) throw new Error('El respaldo contiene movimientos de ahorro inválidos.');
    ids.add(m.id);
  }
  if (!b.finance.budgets || typeof b.finance.budgets !== 'object' || Array.isArray(b.finance.budgets) || !Object.entries(b.finance.budgets).every(([key,val]) => /^\d{4}-(0[1-9]|1[0-2])$/.test(key) && validAmount(val))) throw new Error('Los presupuestos del respaldo son inválidos.');
  const period = b.finance.activePeriod;
  if (!period || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period.key) || period.key !== `${period.year}-${String(period.month).padStart(2,'0')}` || typeof period.label !== 'string') throw new Error('El período activo del respaldo es inválido.');
  return b;
}
export function restoreBackup(backup: AppBackup): boolean {
  const previous = captureBackup();
  function save(b: AppBackup) {
    return StorageService.saveMovements(b.finance.movements) && StorageService.saveBudgets(b.finance.budgets) &&
      PocketsStorageService.savePockets(b.savings.pockets) && PocketsStorageService.saveSavingsMovements(b.savings.movements);
  }
  if (!save(backup)) { save(previous); return false; }
  StorageService.saveActivePeriod(backup.finance.activePeriod);
  return true;
}
export function downloadBackup(backup: AppBackup) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url;
  link.download = `mi-presupuesto-respaldo-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
