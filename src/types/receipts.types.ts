export interface ReceiptItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  category: string;
}
export interface ReceiptDetail {
  documentType: 'expense' | 'income' | 'transfer' | 'unknown';
  merchant: string;
  taxId: string;
  invoiceNumber: string;
  dateISO: string;
  paymentMethod: string;
  subtotalCOP: number;
  discountsCOP: number;
  taxesCOP: number;
  additionalChargesCOP: number;
  totalCOP: number;
  items: ReceiptItem[];
  warnings: string[];
  fileFingerprint?: string;
  recordedAt?: string;
}
