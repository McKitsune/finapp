/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  variant?: 'card' | 'chart' | 'inline' | 'compact';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  variant = 'card',
}) => {
  const isChart = variant === 'chart';
  const isCompact = variant === 'compact';

  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center text-center select-none animate-in fade-in duration-200 ${
        isChart
          ? 'py-12 sm:py-16 px-4 sm:px-8'
          : isCompact
          ? 'py-6 px-3'
          : 'py-10 px-6'
      }`}
    >
      {/* Contenedor de ícono / ilustración minimalista */}
      <div
        className={`rounded-3xl flex items-center justify-center shadow-xs transition-transform hover:scale-105 ${
          isChart
            ? 'w-16 h-16 sm:w-20 sm:h-20 bg-[#F0F2F2] border border-black/[0.04] text-[#16171B] mb-4'
            : isCompact
            ? 'w-11 h-11 bg-[#F0F2F2] text-slate-700 mb-2.5'
            : 'w-14 h-14 bg-[#F0F2F2] text-[#16171B] mb-3.5'
        }`}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Título del estado vacío */}
      <h3
        className={`font-extrabold text-[#16171B] tracking-tight ${
          isChart
            ? 'text-lg sm:text-xl'
            : isCompact
            ? 'text-sm'
            : 'text-base sm:text-lg'
        }`}
      >
        {title}
      </h3>

      {/* Descripción explicativa */}
      <p
        className={`text-[#6E737B] font-normal max-w-sm leading-relaxed ${
          isChart
            ? 'mt-1.5 text-xs sm:text-sm'
            : isCompact
            ? 'mt-0.5 text-xs'
            : 'mt-1 text-xs sm:text-sm'
        }`}
      >
        {description}
      </p>

      {/* Botones de acción principal y secundaria */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#16171B] hover:bg-black text-[#E2FE52] font-extrabold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E2FE52]"
            >
              <Plus className="w-4 h-4 stroke-[3]" aria-hidden="true" />
              <span>{actionLabel}</span>
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
