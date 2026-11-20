/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Wallet, Plus, PiggyBank, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { SavingsPocket, SavingsMovement, NewPocketFormData, NewSavingsMovementFormData, TransferPocketFormData } from '../../types/pockets.types';
import { PocketCard } from './PocketCard';
import { NewPocketModal } from './NewPocketModal';
import { DepositWithdrawModal } from './DepositWithdrawModal';
import { TransferPocketModal } from './TransferPocketModal';
import { PocketDetailModal } from './PocketDetailModal';
import { calculatePocketCurrentSaved } from '../../utils/pockets.utils';
import { formatCurrencyCOP } from '../../utils/finance.utils';

interface PocketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pockets: SavingsPocket[];
  savingsMovements: SavingsMovement[];
  onSavePocket: (data: NewPocketFormData, editId?: string) => void;
  onDeletePocket: (pocketId: string) => void;
  onSaveSavingsMovement: (data: NewSavingsMovementFormData) => boolean;
  onTransferSavings: (data: TransferPocketFormData) => boolean;
  onDeleteSavingsMovement: (movementId: string) => void;
  freeAvailableBalanceCOP: number;
}

export const PocketsModal: React.FC<PocketsModalProps> = ({
  isOpen,
  onClose,
  pockets,
  savingsMovements,
  onSavePocket,
  onDeletePocket,
  onSaveSavingsMovement,
  onTransferSavings,
  onDeleteSavingsMovement,
  freeAvailableBalanceCOP,
}) => {
  const [isNewPocketOpen, setIsNewPocketOpen] = useState<boolean>(false);
  const [pocketToEdit, setPocketToEdit] = useState<SavingsPocket | null>(null);

  const [depositModalState, setDepositModalState] = useState<{
    isOpen: boolean;
    pocket: SavingsPocket | null;
    type: 'deposit' | 'withdrawal';
  }>({ isOpen: false, pocket: null, type: 'deposit' });

  const [transferPocket, setTransferPocket] = useState<SavingsPocket | null>(null);
  const [detailPocket, setDetailPocket] = useState<SavingsPocket | null>(null);

  if (!isOpen) return null;

  // Totales globales de bolsillos
  const totalReservedCOP = pockets.reduce((acc, p) => {
    return acc + calculatePocketCurrentSaved(p.id, savingsMovements);
  }, 0);

  const totalTargetCOP = pockets.reduce((acc, p) => acc + p.targetAmountCOP, 0);
  const globalProgress = totalTargetCOP > 0 ? Math.min(100, (totalReservedCOP / totalTargetCOP) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pockets-dashboard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-6xl bg-white rounded-[32px] shadow-2xl border border-black/10 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E2FE52] flex items-center justify-center text-[#16171B] shadow-sm">
              <PiggyBank className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="pockets-dashboard-title" className="text-xl sm:text-2xl font-extrabold text-[#16171B] tracking-tight">
                Bolsillos de Ahorro y Metas
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Gestiona tus metas económicas, aportes planificados y cumplimiento real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setPocketToEdit(null);
                setIsNewPocketOpen(true);
              }}
              className="px-4 py-2.5 rounded-full bg-[#16171B] hover:bg-black text-[#E2FE52] font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nuevo bolsillo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar modal"
              className="w-10 h-10 rounded-full bg-[#F0F2F2] hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-[#ECEFEF]/30">
          {/* Tarjetas resumen global */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-[26px] border border-black/[0.04] shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Total Ahorrado en Bolsillos</span>
              <span className="text-2xl sm:text-3xl font-black text-[#16171B] font-mono tabular-nums">
                {formatCurrencyCOP(totalReservedCOP)}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">
                De un objetivo total de {formatCurrencyCOP(totalTargetCOP)} ({globalProgress.toFixed(1)}%)
              </span>
            </div>

            <div className="p-5 bg-white rounded-[26px] border border-black/[0.04] shadow-xs">
              <span className="text-xs font-bold text-slate-500 block mb-1">Dinero Reservado vs Libre</span>
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <span className="text-lg font-black text-[#7666F5] font-mono tabular-nums">
                    {formatCurrencyCOP(totalReservedCOP)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Reservado</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-600 font-mono tabular-nums">
                    {formatCurrencyCOP(freeAvailableBalanceCOP)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Libre disponible</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-[#16171B] text-white rounded-[26px] shadow-lg flex flex-col justify-between">
              <span className="text-xs font-bold text-[#E2FE52] uppercase tracking-wider">Bolsillos activos</span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-3xl font-black font-mono">{pockets.length}</span>
                <PiggyBank className="w-8 h-8 text-[#E2FE52]/80" />
              </div>
            </div>
          </div>

          {/* Listado de bolsillos */}
          {pockets.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[26px] border border-black/[0.04]">
              <PiggyBank className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-extrabold text-[#16171B]">No tienes bolsillos de ahorro creados</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                Crea tu primer bolsillo para comenzar a planificar tus metas y comparar tus aportes reales frente al plan.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPocketToEdit(null);
                  setIsNewPocketOpen(true);
                }}
                className="px-6 py-2.5 rounded-full bg-[#16171B] text-[#E2FE52] font-extrabold text-xs shadow-md cursor-pointer"
              >
                Crear primer bolsillo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pockets.map((pocket) => (
                <PocketCard
                  key={pocket.id}
                  pocket={pocket}
                  movements={savingsMovements}
                  onDeposit={(p) => setDepositModalState({ isOpen: true, pocket: p, type: 'deposit' })}
                  onWithdraw={(p) => setDepositModalState({ isOpen: true, pocket: p, type: 'withdrawal' })}
                  onTransfer={(p) => setTransferPocket(p)}
                  onViewDetail={(p) => setDetailPocket(p)}
                  onEdit={(p) => {
                    setPocketToEdit(p);
                    setIsNewPocketOpen(true);
                  }}
                  onDelete={(p) => onDeletePocket(p.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modales internos */}
        <NewPocketModal
          isOpen={isNewPocketOpen}
          onClose={() => setIsNewPocketOpen(false)}
          pocketToEdit={pocketToEdit}
          onSave={onSavePocket}
        />

        <DepositWithdrawModal
          isOpen={depositModalState.isOpen}
          onClose={() => setDepositModalState({ isOpen: false, pocket: null, type: 'deposit' })}
          pocket={depositModalState.pocket}
          initialType={depositModalState.type}
          onSave={onSaveSavingsMovement}
        />

        <TransferPocketModal
          isOpen={Boolean(transferPocket)}
          onClose={() => setTransferPocket(null)}
          sourcePocket={transferPocket}
          allPockets={pockets}
          allMovements={savingsMovements}
          onTransfer={onTransferSavings}
        />

        <PocketDetailModal
          isOpen={Boolean(detailPocket)}
          onClose={() => setDetailPocket(null)}
          pocket={detailPocket}
          movements={savingsMovements}
          onDeleteMovement={onDeleteSavingsMovement}
        />
      </div>
    </div>
  );
};
