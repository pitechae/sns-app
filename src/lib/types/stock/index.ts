/**
 * Stock module types
 */

// Stock transaction types
export type StockTransactionType = 'sale' | 'purchase' | 'return' | 'adjustment';

// Stock transaction interface
export interface StockTransaction {
  id: string;
  date: string;
  productId: string;
  sku: string;
  productName: string;
  quantity: number;  // Positive for incoming, negative for outgoing
  type: StockTransactionType;
  reference: string; // Reference to related document (e.g., sale transaction ID)
  notes?: string;
}

// Stock transaction filter interface
export interface StockTransactionFilter {
  productId?: string;
  sku?: string;
  fromDate?: string;
  toDate?: string;
  type?: StockTransactionType;
}

// Pagination interface (reused from POS types)
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
