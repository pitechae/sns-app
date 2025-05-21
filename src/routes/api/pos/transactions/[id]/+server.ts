import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { transactionService } from '$lib/server/services/pos/transactionService';

export const GET: RequestHandler = async ({ params, platform }) => {
  try {
    const { id } = params;
    
    // Get transaction by ID
    const transaction = await transactionService.getTransactionById(id);
    
    if (!transaction) {
      return json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    return json(transaction);
  } catch (error) {
    console.error(`Error fetching transaction ${params.id}:`, error);
    return json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, platform }) => {
  try {
    // This would handle transaction updates in a real implementation
    // For now, we'll return a mock response
    return json({ success: true, message: 'Transaction updated successfully' });
  } catch (error) {
    console.error(`Error updating transaction ${params.id}:`, error);
    return json({ error: 'Failed to update transaction' }, { status: 500 });
  }
};
