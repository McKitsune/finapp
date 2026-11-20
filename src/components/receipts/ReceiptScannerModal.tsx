import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, FileText, LoaderCircle, ScanLine, Upload, X, AlertTriangle, Trash2, Plus } from 'lucide-react';
import type { FinanceMovement, ExpenseCategory, NewExpenseFormData } from '../../types/finance.types';
import type { ReceiptDetail, ReceiptItem } from '../../types/receipts.types';
import { formatCurrencyCOP } from '../../utils/finance.utils';

const categories: ExpenseCategory[] = ['Alimentación', 'Transporte', 'Servicios públicos', 'Ropa y compras personales', 'Entretenimiento y ocio', 'Salud', 'Educación', 'Hogar', 'Otros'];
const MAX_SIZE = 8 * 1024 * 1024;
const accepted = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
function amount(value: string): number { const n = Number(value); return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0; }
function isoDateValid(x: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(x)) return false; const d = new Date(`${x}T12:00:00Z`); return !isNaN(d.getTime()) && d.toISOString().startsWith(x); }
function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.readAsDataURL(file);
  });
}
async function hashFile(file: File) {
  const hash = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(hash)).map(x => x.toString(16).padStart(2, '0')).join('');
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  movements: FinanceMovement[];
  onSaveExpense: (data: NewExpenseFormData) => boolean;
  onOpenManualExpense: () => void;
}

export const ReceiptScannerModal: React.FC<Props> = ({ isOpen, onClose, movements, onSaveExpense, onOpenManualExpense }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState<ReceiptDetail | null>(null);
  const [category, setCategory] = useState<ExpenseCategory>('Alimentación');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [duplicateAllowed, setDuplicateAllowed] = useState(false);
  const [fileHash, setFileHash] = useState('');
  const cancelRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) { setPreview(''); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  useEffect(() => () => cancelRef.current?.abort(), []);
  if (!isOpen) return null;

  function selectFile(selected?: File) {
    setResult(null); setError(''); setDuplicateAllowed(false); setFileHash(''); setFile(null);
    if (!selected) return;
    if (!accepted.includes(selected.type)) { setError('Admitimos JPG, PNG, WEBP y PDF.'); return; }
    if (selected.size > MAX_SIZE) { setError('Para esta versión, el archivo debe pesar menos de 8 MB.'); return; }
    setFile(selected);
  }
  async function analyze() {
    if (!file || loading) return;
    setError(''); setLoading(true); setResult(null);
    const controller = new AbortController();
    cancelRef.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 90_000);
    try {
      const [base64, fingerprint] = await Promise.all([toBase64(file), hashFile(file)]);
      const response = await fetch('/api/assistant/receipt', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mimeType: file.type, base64 }), signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo analizar el comprobante.');
      setFileHash(fingerprint);
      setResult({ ...data, fileFingerprint: fingerprint, recordedAt: new Date().toISOString() });
      setCategory(categories.includes(data.items?.[0]?.category) ? data.items[0].category : 'Alimentación');
    } catch (e: any) { setError(e.name === 'AbortError' ? 'La solicitud agotó el tiempo. Reintenta.' : String(e.message || 'No se pudo analizar.')); }
    finally { window.clearTimeout(timer); setLoading(false); cancelRef.current = null; }
  }
  function update<K extends keyof ReceiptDetail>(key: K, value: ReceiptDetail[K]) { setResult(prev => prev ? { ...prev, [key]: value } : prev); }
  function updateItem(index: number, key: keyof ReceiptItem, value: string) {
    setResult(prev => prev ? { ...prev, items: prev.items.map((p, i) => i === index ? { ...p, [key]: ['quantity', 'unitPrice', 'lineTotal'].includes(key) ? Number(value) : value } : p) } : prev);
  }
  const suspected = result && movements.filter(m => m.type === 'expense' && (
    (fileHash && m.receipt?.fileFingerprint === fileHash) ||
    (result.taxId && result.invoiceNumber && m.receipt?.taxId === result.taxId && m.receipt?.invoiceNumber === result.invoiceNumber) ||
    (m.dateISO === result.dateISO && m.amountCOP === result.totalCOP && m.description.toLowerCase().includes(result.merchant.toLowerCase()) && Boolean(result.merchant))
  ));
  function save() {
    if (!result || saving) return;
    if (result.documentType !== 'expense') { setError('Solo se registran facturas de gastos. Para ingresos o transferencias utiliza el formulario correspondiente.'); return; }
    if (!isoDateValid(result.dateISO)) { setError('Revisa y completa la fecha válida del comprobante.'); return; }
    if (!Number.isSafeInteger(result.totalCOP) || result.totalCOP <= 0) { setError('Confirma el total de la factura antes de guardar.'); return; }
    if (!result.merchant.trim()) { setError('Escribe el comercio o una descripción del gasto.'); return; }
    if (suspected?.length && !duplicateAllowed) { setError('Revisa el posible duplicado antes de continuar.'); return; }
    setSaving(true); setError('');
    const saved = onSaveExpense({ amountCOP: result.totalCOP, description: result.merchant.trim(), category,
      dateStr: result.dateISO, notes: result.invoiceNumber ? `Factura ${result.invoiceNumber}` : 'Factura digitalizada', receipt: result });
    setSaving(false);
    if (saved) { setFile(null); setResult(null); onClose(); }
    else setError('No se pudo guardar la factura en este navegador. Revisa el espacio disponible.');
  }
  const fieldStyle = 'w-full bg-[#F5F7F7] rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime-300';
  return <div role="dialog" aria-modal="true" aria-label="Escanear factura" className="fixed inset-0 z-[80] bg-black/60 flex items-center justify-center p-2 sm:p-6">
    <div className="bg-white rounded-[28px] shadow-2xl max-w-5xl w-full max-h-[96vh] overflow-hidden flex flex-col">
      <header className="flex justify-between items-center gap-3 p-5 border-b border-slate-100">
        <div className="flex items-center gap-3"><div className="bg-[#E2FE52] rounded-xl p-3"><ScanLine className="w-5 h-5" /></div><div><h2 className="font-extrabold text-xl">Escanear factura</h2><p className="text-xs text-slate-500">Gemini extrae los datos, tú los revisas y confirmas.</p></div></div>
        <button type="button" aria-label="Cerrar" className="p-2 bg-slate-100 rounded-full" onClick={() => { cancelRef.current?.abort(); onClose(); }}><X size={18}/></button>
      </header>
      <div className="overflow-y-auto p-5 space-y-5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <label className="flex-1 border-2 border-dashed rounded-2xl p-5 cursor-pointer hover:border-lime-400 flex flex-col items-center gap-2 bg-[#FAFBFB] text-sm font-semibold"><Upload size={24} /> Cargar foto o PDF<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={e=>selectFile(e.target.files?.[0])}/></label>
          <label className="flex-1 border-2 border-dashed rounded-2xl p-5 cursor-pointer hover:border-lime-400 flex flex-col items-center gap-2 bg-[#FAFBFB] text-sm font-semibold"><Camera size={24}/> Tomar foto<input type="file" accept="image/*" capture="environment" className="sr-only" onChange={e=>selectFile(e.target.files?.[0])}/></label>
        </div>
        {file && <div className="rounded-xl border p-3 flex flex-wrap justify-between items-center gap-2"><span className="text-sm font-semibold"><FileText size={16} className="inline mr-2"/>{file.name} ({Math.round(file.size/1024)} KB)</span><button type="button" disabled={loading} onClick={analyze} className="bg-[#16171B] text-[#E2FE52] px-5 py-2.5 rounded-full text-sm font-bold disabled:opacity-50">{loading ? <><LoaderCircle size={16} className="inline animate-spin mr-2"/> Analizando...</> : 'Analizar con Gemini'}</button></div>}
        {error && <div role="alert" className="bg-rose-50 text-rose-800 p-3 rounded-xl text-sm"><AlertTriangle className="inline mr-2" size={16}/>{error}</div>}
        {result && <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <div className="md:col-span-2 bg-[#F5F7F7] rounded-2xl p-3 min-h-56 flex flex-col items-center gap-3">
            {preview ? <img src={preview} alt="Vista previa del comprobante" className="max-h-[400px] object-contain rounded-xl"/> : <><FileText size={40} className="text-slate-400"/><p className="text-sm">{file?.name}</p></>}
            <p className="text-xs text-slate-500 text-center">La imagen no se guarda en el historial; solo se guarda la información confirmada.</p>
          </div>
          <div className="md:col-span-3 space-y-3">
            <div className="bg-[#F5F7F7] p-3 rounded-xl"><label className="text-xs font-bold">Tipo identificado</label><p className="text-sm">{({expense:'Compra / gasto', income:'Ingreso',transfer:'Transferencia',unknown:'No determinado'} as const)[result.documentType]}</p></div>
            {result.documentType !== 'expense' && <p className="bg-amber-50 text-amber-800 text-sm p-3 rounded-xl">Este comprobante no se identificó como compra; evita registrarlo como gasto.</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="text-xs font-bold">Comercio<input className={fieldStyle} value={result.merchant} onChange={e=>update('merchant',e.target.value)}/></label>
              <label className="text-xs font-bold">Fecha<input type="date" className={fieldStyle} value={result.dateISO} onChange={e=>update('dateISO',e.target.value)}/></label>
              <label className="text-xs font-bold">NIT<input className={fieldStyle} value={result.taxId} onChange={e=>update('taxId',e.target.value)}/></label>
              <label className="text-xs font-bold">Número de factura<input className={fieldStyle} value={result.invoiceNumber} onChange={e=>update('invoiceNumber',e.target.value)}/></label>
              <label className="text-xs font-bold">Categoría<select className={fieldStyle} value={category} onChange={e=>setCategory(e.target.value as ExpenseCategory)}>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
              <label className="text-xs font-bold">Total pagado (COP)<input type="number" min="1" step="1" className={fieldStyle} value={result.totalCOP} onChange={e=>update('totalCOP',amount(e.target.value))}/></label>
            </div>
            <div className="flex items-center justify-between"><h3 className="font-extrabold">Productos ({result.items.length})</h3><button className="text-xs font-semibold inline-flex items-center gap-1" type="button" onClick={()=>update('items',[...result.items,{description:'',quantity:1,unit:'und',unitPrice:0,lineTotal:0,category:''}])}><Plus size={14}/> Añadir producto</button></div>
            <div className="space-y-2 max-h-56 overflow-y-auto">{result.items.map((item,i)=><div key={i} className="grid grid-cols-12 gap-1 items-end bg-[#F5F7F7] rounded-xl p-2">
              <label className="col-span-5 text-[10px]">Producto<input className={fieldStyle} value={item.description} onChange={e=>updateItem(i,'description',e.target.value)}/></label>
              <label className="col-span-2 text-[10px]">Cant.<input type="number" min="0" className={fieldStyle} value={item.quantity} onChange={e=>updateItem(i,'quantity',e.target.value)}/></label>
              <label className="col-span-4 text-[10px]">Total COP<input type="number" min="0" className={fieldStyle} value={item.lineTotal} onChange={e=>updateItem(i,'lineTotal',e.target.value)}/></label>
              <button className="col-span-1 p-2 text-rose-700" aria-label="Eliminar producto" type="button" onClick={()=>update('items',result.items.filter((_,j)=>i!==j))}><Trash2 size={16}/></button>
            </div>)}</div>
            <div className="p-3 rounded-xl bg-[#F5F7F7] text-xs space-y-1"><p>Productos identificados: <b>{formatCurrencyCOP(result.items.reduce((s,x)=>s+x.lineTotal,0))}</b></p><p>Subtotal: {formatCurrencyCOP(result.subtotalCOP)} · Impuestos: {formatCurrencyCOP(result.taxesCOP)} · Descuentos: {formatCurrencyCOP(result.discountsCOP)}</p><p className="font-bold text-sm">Total confirmado: {formatCurrencyCOP(result.totalCOP)}</p><p className="text-slate-500">Algunas facturas tienen impuestos incluidos en los precios. Revisa el total antes de registrar.</p></div>
            {result.warnings?.length > 0 && <div role="note" className="p-3 bg-amber-50 text-amber-900 rounded-xl text-xs"><b>Revisión requerida:</b><ul className="list-disc pl-5">{result.warnings.map((w,i)=><li key={i}>{w}</li>)}</ul></div>}
            {suspected && suspected.length > 0 && <div className="bg-orange-50 text-orange-900 rounded-xl p-3 text-sm"><b>Posible duplicado:</b> {suspected[0].description}, {formatCurrencyCOP(suspected[0].amountCOP)} ({suspected[0].dateISO}).<label className="flex gap-2 mt-2"><input type="checkbox" checked={duplicateAllowed} onChange={e=>setDuplicateAllowed(e.target.checked)}/> Revisé la coincidencia y quiero registrar una compra diferente.</label></div>}
          </div>
        </div>}
      </div>
      <footer className="border-t p-4 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={()=>{onClose();onOpenManualExpense();}} className="border rounded-full py-2 px-4 text-sm font-bold">Registro manual</button>
        <button type="button" onClick={onClose} className="border rounded-full py-2 px-4 text-sm font-bold">Cancelar</button>
        {result && <button type="button" disabled={saving || loading || result.documentType!=='expense'} onClick={save} className="bg-[#E2FE52] disabled:opacity-50 rounded-full py-2 px-5 text-sm font-extrabold inline-flex items-center gap-2"><Check size={16}/> Confirmar y registrar un gasto</button>}
      </footer>
    </div>
  </div>;
};
