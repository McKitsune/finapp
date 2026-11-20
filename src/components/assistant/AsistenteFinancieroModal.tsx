/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, CheckCircle2, AlertTriangle, TrendingDown, TrendingUp, PiggyBank, RefreshCw } from 'lucide-react';
import { FinanceMovement, PeriodIdentifier, FinancialSummary, NewExpenseFormData, NewIncomeFormData } from '../../types/finance.types';
import { SavingsPocket, SavingsMovement, NewSavingsMovementFormData, TransferPocketFormData } from '../../types/pockets.types';
import { formatCurrencyCOP, getTodayISODate } from '../../utils/finance.utils';
import { calculatePocketCurrentSaved, calculatePocketSummary } from '../../utils/pockets.utils';
import { VoiceCapture } from './VoiceCapture';
import { ScanLine } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actionProposal?: {
    action: string;
    payload: any;
  };
  isExecuted?: boolean;
  isCancelled?: boolean;
}

interface AsistenteFinancieroModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePeriod: PeriodIdentifier;
  summary: FinancialSummary;
  movements: FinanceMovement[];
  pockets: SavingsPocket[];
  savingsMovements: SavingsMovement[];
  onExecuteExpense: (data: NewExpenseFormData) => boolean;
  onExecuteIncome: (data: NewIncomeFormData) => boolean;
  onExecutePocketContribution: (data: NewSavingsMovementFormData) => boolean;
  onExecutePocketWithdrawal: (data: NewSavingsMovementFormData) => boolean;
  onExecuteTransfer: (data: TransferPocketFormData) => boolean;
  onOpenReceipt: () => void;
}

export const AsistenteFinancieroModal: React.FC<AsistenteFinancieroModalProps> = ({
  isOpen,
  onClose,
  activePeriod,
  summary,
  movements,
  pockets,
  savingsMovements,
  onExecuteExpense,
  onExecuteIncome,
  onExecutePocketContribution,
  onExecutePocketWithdrawal,
  onExecuteTransfer,
  onOpenReceipt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: '¡Hola! Soy tu asistente financiero con inteligencia artificial. ¿En qué puedo ayudarte hoy con tu presupuesto o ahorros?',
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const executedIds = useRef<Set<string>>(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const totalReservedCOP = pockets.reduce((acc, p) => acc + calculatePocketCurrentSaved(p.id, savingsMovements), 0);
      const netSavedThisMonth = savingsMovements.filter(m => m.dateISO.startsWith(activePeriod.key) && (m.type === 'deposit' || m.type === 'withdrawal'))
        .reduce((acc, m) => acc + (m.type === 'deposit' ? m.amountCOP : -m.amountCOP), 0);
      const freeAvailableBalanceCOP = summary.availableBalanceCOP - netSavedThisMonth;

      const financialContext = {
        activePeriod: activePeriod.label,
        budgetCOP: summary.budgetCOP,
        additionalIncomeCOP: summary.additionalIncomeCOP,
        totalExpensesCOP: summary.totalExpensesCOP,
        availableBalanceCOP: summary.availableBalanceCOP,
        totalReservedCOP,
        freeAvailableBalanceCOP,
        pockets: pockets.map((p) => ({
          id: p.id,
          name: p.name,
          target: p.targetAmountCOP,
          currentSaved: calculatePocketCurrentSaved(p.id, savingsMovements),
          frequency: p.frequency,
          expectedSaved: calculatePocketSummary(p, savingsMovements).expectedSavedCOP,
          status: calculatePocketSummary(p, savingsMovements).status,
        })),
        recentMovementsCount: movements.length,
      };

      const chatHistory = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const response = await fetch('/api/assistant/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          financialContext,
          chatHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la respuesta del asistente.');
      }

      let verifiedText = data.replyMessage || 'He procesado tu consulta.';
      if (data.action === 'get_summary') {
        verifiedText = `Resumen de ${activePeriod.label}: presupuesto base ${formatCurrencyCOP(summary.budgetCOP)}, ingresos adicionales ${formatCurrencyCOP(summary.additionalIncomeCOP)}, gastos ${formatCurrencyCOP(summary.totalExpensesCOP)}, saldo presupuestal ${formatCurrencyCOP(summary.availableBalanceCOP)} y dinero libre del período ${formatCurrencyCOP(freeAvailableBalanceCOP)}.`;
      } else if (data.action === 'simulate_expense') {
        const value = data.payload?.amountCOP;
        verifiedText = Number.isSafeInteger(value) && value > 0
          ? `Simulación (sin registrar): dinero libre ${formatCurrencyCOP(freeAvailableBalanceCOP)}. Tras una compra de ${formatCurrencyCOP(value)}, quedarían ${formatCurrencyCOP(freeAvailableBalanceCOP - value)}. Esto no incluye obligaciones que no hayas registrado.`
          : '¿Cuál sería el importe de la compra que deseas simular?';
      } else if (data.action === 'get_pocket_status') {
        const selected = pockets.filter(p => !data.payload?.pocketId || p.id === data.payload.pocketId);
        verifiedText = selected.length ? selected.map(p => {
          const x = calculatePocketSummary(p, savingsMovements);
          return `${p.name}: ahorrado ${formatCurrencyCOP(x.currentSavedCOP)} de ${formatCurrencyCOP(x.targetAmountCOP)}, esperado a la fecha ${formatCurrencyCOP(x.expectedSavedCOP)}, diferencia ${formatCurrencyCOP(x.differenceCOP)} (${x.statusLabel}).`;
        }).join('\n') : 'No encontré el bolsillo solicitado. Indica su nombre exacto.';
      }
      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        role: 'assistant',
        text: verifiedText,
        actionProposal: ['register_expense','register_income','add_pocket','withdraw_pocket','transfer_pocket'].includes(data.action) ? {
          action: data.action,
          payload: data.payload,
        } : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Error conversando con el asistente:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        text: err.message || 'Lo siento, ocurrió un error al conectar con el asistente. Inténtalo nuevamente.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = (msgId: string, proposal: { action: string; payload: any }) => {
    if (executedIds.current.has(msgId)) return;
    const item = messages.find(m => m.id === msgId);
    if (!item || item.isCancelled || item.isExecuted) return;
    executedIds.current.add(msgId); // bloqueo sincrónico contra clics dobles
    const { action, payload = {} } = proposal;
    const todayISO = getTodayISODate();
    try {
      if (!Number.isSafeInteger(payload.amountCOP) || payload.amountCOP <= 0) {
        throw new Error('El monto debe ser un número entero positivo en COP.');
      }
      const dateStr = payload.dateStr || todayISO;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || Number.isNaN(Date.parse(dateStr + 'T12:00:00Z'))) {
        throw new Error('La fecha de la operación es inválida.');
      }
      let saved = false;
      if (action === 'register_expense') {
        if (!payload.description?.trim()) throw new Error('Falta la descripción del gasto.');
        const valid: NewExpenseFormData['category'][] = ['Alimentación','Transporte','Servicios públicos','Ropa y compras personales','Entretenimiento y ocio','Salud','Educación','Hogar','Otros'];
        if (!valid.includes(payload.category)) throw new Error('Es necesario seleccionar una categoría válida.');
        saved = onExecuteExpense({ amountCOP: payload.amountCOP, description: payload.description, category: payload.category, dateStr, notes: payload.notes });
      } else if (action === 'register_income') {
        if (!payload.description?.trim()) throw new Error('Falta la descripción del ingreso.');
        const valid: NewIncomeFormData['category'][] = ['Salario','Trabajo independiente','Negocio','Bonificación','Regalo','Reembolso','Otros'];
        if (!valid.includes(payload.category)) throw new Error('Es necesario seleccionar una categoría válida.');
        saved = onExecuteIncome({ amountCOP: payload.amountCOP, description: payload.description, category: payload.category, dateStr, notes: payload.notes });
      } else if (action === 'add_pocket' || action === 'withdraw_pocket') {
        const target = pockets.find(p => p.id === payload.pocketId);
        if (!target) throw new Error('No identifiqué un bolsillo válido. Especifica su nombre.');
        if (action === 'withdraw_pocket' && calculatePocketCurrentSaved(target.id, savingsMovements) < payload.amountCOP) {
          throw new Error('El bolsillo no tiene saldo suficiente.');
        }
        saved = (action === 'add_pocket' ? onExecutePocketContribution : onExecutePocketWithdrawal)({
          pocketId: target.id, type: action === 'add_pocket' ? 'deposit' : 'withdrawal',
          amountCOP: payload.amountCOP, dateStr, notes: payload.notes || 'Operación confirmada en el asistente',
        });
      } else if (action === 'transfer_pocket') {
        if (!payload.sourcePocketId || !payload.targetPocketId || payload.sourcePocketId === payload.targetPocketId) {
          throw new Error('Debes identificar dos bolsillos diferentes.');
        }
        if (!pockets.some(p => p.id === payload.sourcePocketId) || !pockets.some(p => p.id === payload.targetPocketId)) {
          throw new Error('Uno de los bolsillos no existe.');
        }
        if (calculatePocketCurrentSaved(payload.sourcePocketId, savingsMovements) < payload.amountCOP) throw new Error('El bolsillo de origen no tiene fondos suficientes.');
        saved = onExecuteTransfer({ sourcePocketId: payload.sourcePocketId, targetPocketId: payload.targetPocketId,
          amountCOP: payload.amountCOP, dateStr, notes: payload.notes });
      } else {
        throw new Error('La acción solicitada no está permitida.');
      }
      if (!saved) throw new Error('No se pudo guardar la operación. No se modificaron los datos.');
      setMessages(prev => [...prev.map(m => m.id === msgId ? { ...m, isExecuted: true } : m),
        { id: `msg-ok-${crypto.randomUUID()}`, role: 'assistant', text: `Operación confirmada y guardada por ${formatCurrencyCOP(payload.amountCOP)}.` }]);
    } catch (error: any) {
      executedIds.current.delete(msgId);
      setMessages(prev => [...prev, { id: `msg-error-${crypto.randomUUID()}`, role:'assistant', text: `No se ejecutó la operación: ${error.message}` }]);
    }
  };

  const handleCancelAction = (msgId: string) => {
    if (executedIds.current.has(msgId)) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isCancelled: true } : m))
    );
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-cancel-${Date.now()}`,
        role: 'assistant',
        text: 'Operación cancelada.',
      },
    ]);
  };

  const suggestions = [
    'Registrar un gasto de 35 mil en almuerzo',
    '¿Cuánto dinero tengo disponible?',
    'Consultar mis bolsillos de ahorro',
    'Simular un gasto de 300 mil',
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-title"
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col border-l border-black/10 animate-in slide-in-from-right duration-300">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E2FE52] flex items-center justify-center text-[#16171B] shadow-xs">
              <Bot className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="assistant-title" className="text-xl font-extrabold text-[#16171B] tracking-tight">
                Asistente financiero
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Organiza tu dinero con ayuda de la inteligencia artificial.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar asistente"
            className="w-9 h-9 rounded-full bg-[#F0F2F2] hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Área de conversación */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FAFA]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
              >
                <div
                  className={`max-w-[88%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-[#16171B] text-white rounded-br-xs'
                      : 'bg-white text-[#16171B] border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Tarjeta de confirmación obligatoria para operaciones */}
                {msg.actionProposal && (
                  <div className="w-full max-w-sm bg-white rounded-2xl p-4 border-2 border-[#E2FE52] shadow-md space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#16171B]">
                      <Sparkles className="w-4 h-4 text-[#7666F5]" />
                      <span>Operación propuesta por el asistente:</span>
                    </div>

                    <div className="p-3 bg-[#F8FAFA] rounded-xl space-y-1 text-xs font-medium text-slate-700">
                      <p><span className="font-bold">Acción:</span> {msg.actionProposal.action.replace('_', ' ').toUpperCase()}</p>
                      {msg.actionProposal.payload?.amountCOP && (
                        <p><span className="font-bold">Monto:</span> {formatCurrencyCOP(msg.actionProposal.payload.amountCOP)}</p>
                      )}
                      {msg.actionProposal.payload?.description && (
                        <p><span className="font-bold">Descripción:</span> {msg.actionProposal.payload.description}</p>
                      )}
                      {msg.actionProposal.payload?.category && (
                        <p><span className="font-bold">Categoría:</span> {msg.actionProposal.payload.category}</p>
                      )}
                    </div>

                    {msg.isExecuted ? (
                      <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Operación confirmada y ejecutada</span>
                      </div>
                    ) : msg.isCancelled ? (
                      <div className="p-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-2">
                        <X className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Operación cancelada</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleConfirmAction(msg.id, msg.actionProposal!)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#16171B] hover:bg-black text-[#E2FE52] font-extrabold text-xs inline-flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-transform hover:scale-[1.02]"
                        >
                          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                          <span>Confirmar operación</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancelAction(msg.id)}
                          className="py-2 px-3 rounded-xl bg-[#F0F2F2] hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Cancelar</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-4 py-3 rounded-2xl border border-slate-200 w-fit animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7666F5]" />
              <span>Analizando y preparando respuesta...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sugerencias iniciales si la conversación está vacía */}
        {messages.length <= 1 && (
          <div className="px-5 py-3 bg-white border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
              Sugerencias rápidas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(sug)}
                  className="px-3 py-1.5 rounded-xl bg-[#F0F2F2] hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white px-4 pt-2">
          <button type="button" onClick={onOpenReceipt}
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#F0F2F2] rounded-xl text-xs font-bold hover:bg-[#E2FE52]">
            <ScanLine size={16}/> Adjuntar factura o comprobante
          </button>
        </div>
        <VoiceCapture onTranscript={text => setInputValue(text)} />

        {/* Campo de escritura y envío */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu consulta o movimiento..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#F0F2F2] border border-transparent focus:border-[#E2FE52] focus:bg-white text-xs sm:text-sm font-semibold text-[#16171B] focus:outline-none focus:ring-2 focus:ring-[#E2FE52]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              aria-label="Enviar mensaje"
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                isLoading || !inputValue.trim()
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#16171B] hover:bg-black text-[#E2FE52] shadow-md hover:scale-105'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
