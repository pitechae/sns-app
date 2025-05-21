import { db } from '$lib/server/database';
import type { Transaction, TransactionItem, PaymentMethod } from '$lib/types/pos';
import { v4 as uuidv4 } from 'uuid';

// Define database result types for better type safety
interface DbQueryResult {
  rows?: any[];
  [key: string]: any;
}

interface DbTransactionRow {
  id: string;
  created_at: string | number | Date;
  total: string | number;
  payment_method: PaymentMethod;
  status: 'completed' | 'refunded' | 'failed';
  [key: string]: any;
}

interface DbTransactionItemRow {
  id: string;
  transaction_id: string;
  product_id: string;
  name: string;
  price: string | number;
  quantity: string | number;
  sku?: string;
  [key: string]: any;
}

/**
 * Service for handling POS transactions
 */
export class TransactionService {
  /**
   * Create a new transaction
   */
  async createTransaction(transaction: Omit<Transaction, 'id' | 'date'>): Promise<Transaction> {
    const id = `TX-${Date.now().toString().slice(-6)}`;
    const date = new Date();
    
    const newTransaction: Transaction = {
      id,
      date: date.toISOString(),
      ...transaction
    };
    
    // In a real implementation, this would insert the transaction into the database
    // For now, we'll simulate this with a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Store transaction items
    for (const item of transaction.items) {
      // Create a new object without transactionId to avoid duplication
      const { transactionId: _, ...itemWithoutTransactionId } = item;
      
      await this.createTransactionItem({
        transactionId: id,  // Use the transaction ID from this transaction
        ...itemWithoutTransactionId
      });
      
      // Update inventory (decrease quantity)
      await this.updateInventory(item.productId, item.quantity);
    }
    
    return newTransaction;
  }
  
  /**
   * Create a transaction item
   */
  private async createTransactionItem(item: Omit<TransactionItem, 'id'>): Promise<TransactionItem> {
    const id = uuidv4();
    
    const newItem: TransactionItem = {
      id,
      transactionId: item.transactionId,
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      sku: item.sku
    };
    
    // In a real implementation, this would insert the item into the database
    // For now, we'll simulate this with a delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return newItem;
  }
  
  /**
   * Update inventory after a sale
   */
  private async updateInventory(productId: string, quantity: number): Promise<void> {
    try {
      // First, get the current product details
      const response = await fetch(`/api/stock/items/${productId}`);
      if (!response.ok) {
        console.error(`Failed to fetch product ${productId} for inventory update`);
        return;
      }
      
      const product = await response.json();
      
      // Create a stock transaction to record the inventory change
      const stockTransaction = {
        itemId: productId,
        type: 'Sale', // This is a sale transaction
        quantity: -quantity, // Negative quantity for sales/outgoing inventory
        notes: `POS sale transaction`
      };
      
      // Send the stock transaction to update inventory
      const updateResponse = await fetch('/api/stock/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stockTransaction)
      });
      
      if (!updateResponse.ok) {
        console.error(`Failed to update inventory for product ${productId}`);
      }
      
      // Broadcast the stock update via WebSocket if available
      try {
        // This would be implemented in a real system
        // For now we'll rely on the WebSocket connection established in the POS component
      } catch (wsError) {
        console.error('WebSocket broadcast error:', wsError);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  }
  
  /**
   * Get all transactions with pagination
   */
  async getTransactions(page = 1, limit = 10, filter?: string): Promise<{ transactions: Transaction[], pagination: { page: number, limit: number, total: number, totalPages: number } }> {
    try {
      // Query the database for transactions
      const query = `
        SELECT t.*, COUNT(ti.id) as item_count
        FROM pos_transactions t
        LEFT JOIN pos_transaction_items ti ON t.id = ti.transaction_id
        GROUP BY t.id
        ORDER BY t.created_at DESC
      `;
      
      const result = await db.query(query) as DbQueryResult;
      
      if (!result || !result.rows) {
        throw new Error('Failed to fetch transactions from database');
      }
      
      // Get transaction items for each transaction
      const transactions = await Promise.all(result.rows.map(async (row: DbTransactionRow) => {
        const itemsQuery = `
          SELECT * FROM pos_transaction_items
          WHERE transaction_id = $1
        `;
        
        const itemsResult = await db.query(itemsQuery, [row.id]) as DbQueryResult;
        const items = itemsResult.rows || [];
        
        return {
          id: row.id,
          date: new Date(row.created_at).toISOString(),
          total: parseFloat(String(row.total)),
          paymentMethod: row.payment_method,
          status: row.status,
          items: items.map((item: DbTransactionItemRow) => ({
            id: item.id,
            transactionId: item.transaction_id,
            productId: item.product_id,
            name: item.name,
            price: parseFloat(String(item.price)),
            quantity: parseInt(String(item.quantity)),
            sku: item.sku || ''
          }))
        };
      }));
      
      // Filter transactions if filter is provided
      let filteredTransactions = transactions;
      if (filter) {
        const lowerFilter = filter.toLowerCase();
        filteredTransactions = transactions.filter((tx: Transaction) => 
          tx.id.toLowerCase().includes(lowerFilter) || 
          tx.paymentMethod.toLowerCase().includes(lowerFilter)
        );
      }
      
      // Apply pagination
      const total = filteredTransactions.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
      
      return {
        transactions: paginatedTransactions,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching transactions from database:', error);
      // Return empty result on error
      return {
        transactions: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      };
    }
  }
  
  /**
   * Get a transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    try {
      // Query the database for the transaction
      const query = `
        SELECT * FROM pos_transactions
        WHERE id = $1
        LIMIT 1
      `;
      
      const result = await db.query(query, [id]) as DbQueryResult;
      
      if (!result || !result.rows || result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0] as DbTransactionRow;
      
      // Get transaction items
      const itemsQuery = `
        SELECT * FROM pos_transaction_items
        WHERE transaction_id = $1
      `;
      
      const itemsResult = await db.query(itemsQuery, [id]) as DbQueryResult;
      const items = itemsResult.rows || [];
      
      return {
        id: row.id,
        date: new Date(row.created_at).toISOString(),
        total: parseFloat(String(row.total)),
        paymentMethod: row.payment_method as PaymentMethod,
        status: row.status as 'completed' | 'refunded' | 'failed',
        items: items.map((item: DbTransactionItemRow) => ({
          id: item.id,
          transactionId: item.transaction_id,
          productId: item.product_id,
          name: item.name,
          price: parseFloat(String(item.price)),
          quantity: parseInt(String(item.quantity)),
          sku: item.sku || ''
        }))
      };
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      return null;
    }
  }
}

export const transactionService = new TransactionService();
