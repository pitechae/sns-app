/**
 * Types for the POS system
 */

/**
 * Product type
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  barcode: string;
  sku?: string;
  image?: string;
  inStock: number;
}

/**
 * Transaction type
 */
export interface Transaction {
  id: string;
  date: string;
  timestamp: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  items: TransactionItem[];
}

/**
 * Transaction item type
 */
export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  currentStock?: number;
}

/**
 * Payment method type
 */
export type PaymentMethod = 'CASH' | 'CARD';

/**
 * Transaction status type
 */
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

/**
 * Printer settings type
 */
export interface PrinterSettings {
  enabled: boolean;
  printerName: string;
  autoPrint: boolean;
  useServerPrinting?: boolean;
}

/**
 * Cart item type
 */
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  sku?: string;
  currentStock: number; // Track current available stock
}

/**
 * Payment result type
 */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  amount?: number;
  paymentMethod?: PaymentMethod;
  error?: string;
}
