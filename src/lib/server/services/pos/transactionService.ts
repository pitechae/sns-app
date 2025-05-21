import { db } from '$lib/server/database';
import type { Transaction, TransactionItem, PaymentMethod } from '$lib/types/pos';
import { v4 as uuidv4 } from 'uuid';

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
    // In a real implementation, this would fetch transactions from the database
    // For now, we'll generate mock data
    const transactions: Transaction[] = [];
    const today = new Date();
    
    // Generate mock transactions
    for (let i = 1; i <= 20; i++) {
      const date = new Date(today);
      date.setHours(date.getHours() - i * 2);
      
      const paymentMethod: PaymentMethod = i % 2 === 0 ? 'CARD' : 'CASH';
      const status = i % 10 === 0 ? 'refunded' : (i % 15 === 0 ? 'failed' : 'completed');
      const itemCount = Math.floor(Math.random() * 5) + 1;
      
      transactions.push({
        id: `TX-${(100000 + i).toString().slice(-6)}`,
        date: date.toISOString(),
        total: parseFloat((Math.random() * 100 + 5).toFixed(2)),
        paymentMethod,
        status,
        items: Array(itemCount).fill(null).map((_, idx) => ({
          id: uuidv4(),
          transactionId: `TX-${(100000 + i).toString().slice(-6)}`,
          productId: `PROD-${(idx + 1) * i}`,
          name: `Product ${(idx + 1) * i}`,
          price: parseFloat((Math.random() * 20 + 1).toFixed(2)),
          quantity: Math.floor(Math.random() * 3) + 1
        }))
      });
    }
    
    // Filter transactions if filter is provided
    let filteredTransactions = transactions;
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      filteredTransactions = transactions.filter(tx => 
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
  }
  
  /**
   * Get a transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    // In a real implementation, this would fetch the transaction from the database
    // For now, we'll simulate this with a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const today = new Date();
    const paymentMethod: PaymentMethod = id.charAt(id.length - 1) === '0' ? 'CARD' : 'CASH';
    const status = id.charAt(id.length - 2) === '0' ? 'refunded' : 'completed';
    const itemCount = Math.floor(Math.random() * 5) + 1;
    
    return {
      id,
      date: today.toISOString(),
      total: parseFloat((Math.random() * 100 + 5).toFixed(2)),
      paymentMethod,
      status,
      items: Array(itemCount).fill(null).map((_, idx) => ({
        id: uuidv4(),
        transactionId: id,
        productId: `PROD-${idx + 1}`,
        name: `Product ${idx + 1}`,
        price: parseFloat((Math.random() * 20 + 1).toFixed(2)),
        quantity: Math.floor(Math.random() * 3) + 1
      }))
    };
  }
}

export const transactionService = new TransactionService();
