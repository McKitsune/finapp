/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SavingsFrequency = 'weekly' | 'biweekly' | 'monthly';

export type SavingsMovementType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out';

export type PocketStatus = 'completed' | 'ahead' | 'on_track' | 'behind' | 'unplanned';

export interface SavingsPocket {
  id: string;
  name: string;
  targetAmountCOP: number;
  startDateISO: string; // YYYY-MM-DD
  targetDateISO: string; // YYYY-MM-DD
  frequency: SavingsFrequency;
  plannedPeriodicAmountCOP: number;
  color: string; // Hex color for UI representation
  createdAt: number;
}

export interface SavingsMovement {
  id: string;
  pocketId: string;
  type: SavingsMovementType;
  amountCOP: number;
  dateISO: string; // YYYY-MM-DD
  date: string; // DD/MM/YYYY
  dateFormattedSpanish: string;
  notes?: string;
  targetPocketId?: string; // Para transferencias entre bolsillos
  createdAt: number;
}

export interface PocketFinancialSummary {
  pocketId: string;
  targetAmountCOP: number;
  currentSavedCOP: number;
  remainingCOP: number;
  progressPercentage: number;
  expectedSavedCOP: number;
  differenceCOP: number; // Real - Esperado
  compliancePercentage: number; // (Real / Esperado) * 100
  status: PocketStatus;
  statusLabel: string;
  badgeColorClass: string;
  remainingPeriods: number;
  requiredPeriodicAmountCOP: number;
  estimatedCompletionDateStr?: string;
}

export interface NewPocketFormData {
  name: string;
  targetAmountCOP: number;
  startDateISO: string;
  targetDateISO: string;
  frequency: SavingsFrequency;
  plannedPeriodicAmountCOP: number;
  color: string;
}

export interface NewSavingsMovementFormData {
  pocketId: string;
  type: 'deposit' | 'withdrawal';
  amountCOP: number;
  dateStr: string; // YYYY-MM-DD
  notes?: string;
}

export interface TransferPocketFormData {
  sourcePocketId: string;
  targetPocketId: string;
  amountCOP: number;
  dateStr: string; // YYYY-MM-DD
  notes?: string;
}
