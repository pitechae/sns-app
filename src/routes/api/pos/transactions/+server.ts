import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { transactionService } from '$lib/server/services/pos/transactionService';
import type { Transaction } from '$lib/types/pos';

export const GET: RequestHandler = async ({ url, platform }) => {
  try {
    // Get query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const filter = url.searchParams.get('filter') || '';
    
    // Get transactions with pagination
    const result = await transactionService.getTransactions(page, limit, filter);
    
    return json(result);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, platform }) => {
  try {
    const data = await request.json();
    
    // Validate transaction data
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return json({ error: 'Transaction must have at least one item' }, { status: 400 });
    }
    
    if (!data.paymentMethod || !['CASH', 'CARD'].includes(data.paymentMethod)) {
      return json({ error: 'Invalid payment method' }, { status: 400 });
    }
    
    if (typeof data.total !== 'number' || data.total <= 0) {
      return json({ error: 'Invalid transaction total' }, { status: 400 });
    }
    
    // Create transaction
    const transaction = await transactionService.createTransaction({
      total: data.total,
      paymentMethod: data.paymentMethod,
      status: 'completed',
      items: data.items
    });
    
    return json({ success: true, transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return json({ error: 'Failed to create transaction' }, { status: 500 });
  }
};
