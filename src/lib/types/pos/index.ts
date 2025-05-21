/**
 * POS module types
 */

// Payment methods supported by the POS system
export type PaymentMethod = 'CASH' | 'CARD';

// Transaction status
export type TransactionStatus = 'completed' | 'refunded' | 'failed';

// Product interface
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  barcode: string;
  image?: string;
  inStock: number;
}

// Transaction item interface
export interface TransactionItem {
  id: string;
  transactionId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// Transaction interface
export interface Transaction {
  id: string;
  date: string;
  total: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  items: TransactionItem[];
}

// Cart item interface (used in the POS terminal)
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// Pagination interface
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Payment result interface
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

// Printer settings interface
export interface PrinterSettings {
  enabled: boolean;
  printerName?: string;
  autoPrint: boolean;
}

// Business info interface for receipts
export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId?: string;
  logo?: string;
}
