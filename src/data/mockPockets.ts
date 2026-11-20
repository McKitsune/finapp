/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavingsPocket, SavingsMovement } from '../types/pockets.types';

export const INITIAL_MOCK_POCKETS: SavingsPocket[] = [
  {
    id: 'pocket-1',
    name: 'Viaje a Cartagena',
    targetAmountCOP: 2500000,
    startDateISO: '2025-05-01',
    targetDateISO: '2025-12-01',
    frequency: 'monthly',
    plannedPeriodicAmountCOP: 350000,
    color: '#7666F5', // Violeta acento
    createdAt: Date.now() - 60 * 86400000,
  },
  {
    id: 'pocket-2',
    name: 'Fondo de Emergencia',
    targetAmountCOP: 5000000,
    startDateISO: '2025-01-01',
    targetDateISO: '2025-12-31',
    frequency: 'monthly',
    plannedPeriodicAmountCOP: 400000,
    color: '#E2FE52', // Amarillo lima
    createdAt: Date.now() - 120 * 86400000,
  },
  {
    id: 'pocket-3',
    name: 'Nuevo Portátil',
    targetAmountCOP: 4000000,
    startDateISO: '2025-06-01',
    targetDateISO: '2025-11-30',
    frequency: 'biweekly',
    plannedPeriodicAmountCOP: 300000,
    color: '#3B82F6', // Azul
    createdAt: Date.now() - 30 * 86400000,
  },
];

export const INITIAL_MOCK_SAVINGS_MOVEMENTS: SavingsMovement[] = [
  {
    id: 'sm-1',
    pocketId: 'pocket-1',
    type: 'deposit',
    amountCOP: 400000,
    dateISO: '2025-05-10',
    date: '10/05/2025',
    dateFormattedSpanish: '10 de mayo de 2025',
    notes: 'Primer aporte mensual',
    createdAt: Date.now() - 55 * 86400000,
  },
  {
    id: 'sm-2',
    pocketId: 'pocket-1',
    type: 'deposit',
    amountCOP: 380000,
    dateISO: '2025-06-10',
    date: '10/06/2025',
    dateFormattedSpanish: '10 de junio de 2025',
    notes: 'Aporte de junio',
    createdAt: Date.now() - 25 * 86400000,
  },
  {
    id: 'sm-3',
    pocketId: 'pocket-1',
    type: 'deposit',
    amountCOP: 350000,
    dateISO: '2025-07-10',
    date: '10/07/2025',
    dateFormattedSpanish: '10 de julio de 2025',
    notes: 'Aporte regular julio',
    createdAt: Date.now() - 5 * 86400000,
  },
  {
    id: 'sm-4',
    pocketId: 'pocket-2',
    type: 'deposit',
    amountCOP: 500000,
    dateISO: '2025-01-15',
    date: '15/01/2025',
    dateFormattedSpanish: '15 de enero de 2025',
    notes: 'Apertura de fondo',
    createdAt: Date.now() - 100 * 86400000,
  },
  {
    id: 'sm-5',
    pocketId: 'pocket-2',
    type: 'deposit',
    amountCOP: 400000,
    dateISO: '2025-03-15',
    date: '15/03/2025',
    dateFormattedSpanish: '15 de marzo de 2025',
    notes: 'Aporte trimestral',
    createdAt: Date.now() - 80 * 86400000,
  },
  {
    id: 'sm-6',
    pocketId: 'pocket-3',
    type: 'deposit',
    amountCOP: 300000,
    dateISO: '2025-06-15',
    date: '15/06/2025',
    dateFormattedSpanish: '15 de junio de 2025',
    notes: 'Primer aporte quincenal',
    createdAt: Date.now() - 20 * 86400000,
  },
];
