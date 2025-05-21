import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/database';
import type { StockTransaction } from '$lib/types/stock';
import { v4 as uuidv4 } from 'uuid';

export const GET: RequestHandler = async ({ url }) => {
  try {
    // Get query parameters for pagination and filtering
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const productId = url.searchParams.get('productId') || null;
    const sku = url.searchParams.get('sku') || null;
    const fromDate = url.searchParams.get('fromDate') || null;
    const toDate = url.searchParams.get('toDate') || null;
    const transactionType = url.searchParams.get('type') || null;

    // In a real implementation, this would fetch transactions from the database
    // For now, we'll generate mock data
    const transactions: StockTransaction[] = [];
    const today = new Date();
    
    // Generate mock transactions
    for (let i = 1; i <= 50; i++) {
      const date = new Date(today);
      date.setHours(date.getHours() - i * 3);
      
      // Alternate between different transaction types
      const type = i % 4 === 0 ? 'adjustment' : 
                  i % 3 === 0 ? 'return' : 
                  i % 2 === 0 ? 'purchase' : 'sale';
      
      // Generate quantity based on transaction type
      const quantity = type === 'sale' || type === 'return' 
        ? -(Math.floor(Math.random() * 5) + 1)  // Negative for outgoing
        : (Math.floor(Math.random() * 10) + 1); // Positive for incoming
      
      // Generate product details
      const productSku = i % 3 === 0 ? 'BPS30' : 'BTS140';
      const productName = i % 3 === 0 ? "BOY'S POLO SHIRT" : "BOY'S SHORT PANT";
      
      transactions.push({
        id: `ST-${(100000 + i).toString().slice(-6)}`,
        date: date.toISOString(),
        productId: `PROD-${i % 10 + 1}`,
        sku: productSku,
        productName: productName,
        quantity: quantity,
        type: type,
        reference: type === 'sale' ? `TX-${(200000 + i).toString().slice(-6)}` : 
                  type === 'purchase' ? `PO-${(300000 + i).toString().slice(-6)}` : 
                  type === 'return' ? `RT-${(400000 + i).toString().slice(-6)}` : 
                  `ADJ-${(500000 + i).toString().slice(-6)}`,
        notes: `${type.charAt(0).toUpperCase() + type.slice(1)} transaction for ${productName}`
      });
    }
    
    // Apply filters
    let filteredTransactions = transactions;
    
    if (productId) {
      filteredTransactions = filteredTransactions.filter(tx => tx.productId === productId);
    }
    
    if (sku) {
      filteredTransactions = filteredTransactions.filter(tx => tx.sku === sku);
    }
    
    if (fromDate) {
      const from = new Date(fromDate);
      filteredTransactions = filteredTransactions.filter(tx => new Date(tx.date) >= from);
    }
    
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // End of day
      filteredTransactions = filteredTransactions.filter(tx => new Date(tx.date) <= to);
    }
    
    if (transactionType) {
      filteredTransactions = filteredTransactions.filter(tx => tx.type === transactionType);
    }
    
    // Apply pagination
    const total = filteredTransactions.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    return json({
      transactions: paginatedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching stock transactions:', error);
    return json({ error: error instanceof Error ? error.message : 'Failed to fetch stock transactions' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.productId || !data.quantity || !data.type) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create a new stock transaction
    const transaction: StockTransaction = {
      id: `ST-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      productId: data.productId,
      sku: data.sku || '',
      productName: data.productName || '',
      quantity: data.quantity,
      type: data.type,
      reference: data.reference || '',
      notes: data.notes || ''
    };
    
    // In a real implementation, this would save the transaction to the database
    // For now, we'll simulate this with a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return json({ success: true, transaction });
  } catch (error) {
    console.error('Error creating stock transaction:', error);
    return json({ error: error instanceof Error ? error.message : 'Failed to create stock transaction' }, { status: 500 });
  }
};
