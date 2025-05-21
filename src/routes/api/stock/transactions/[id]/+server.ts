import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/database';
import type { StockTransaction } from '$lib/types/stock';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;
    
    // In a real implementation, this would fetch the transaction from the database
    // For now, we'll simulate this with a delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate a mock transaction based on the ID
    const idNum = parseInt(id.replace('ST-', '')) || 0;
    const today = new Date();
    const date = new Date(today);
    date.setHours(date.getHours() - (idNum % 24));
    
    // Determine transaction type based on ID
    const typeNum = idNum % 4;
    const type = typeNum === 0 ? 'adjustment' : 
               typeNum === 1 ? 'sale' : 
               typeNum === 2 ? 'purchase' : 'return';
    
    // Generate quantity based on transaction type
    const quantity = type === 'sale' || type === 'return' 
      ? -(Math.floor(Math.random() * 5) + 1)  // Negative for outgoing
      : (Math.floor(Math.random() * 10) + 1); // Positive for incoming
    
    // Generate product details
    const productSku = idNum % 3 === 0 ? 'BPS30' : 'BTS140';
    const productName = idNum % 3 === 0 ? "BOY'S POLO SHIRT" : "BOY'S SHORT PANT";
    
    const transaction: StockTransaction = {
      id,
      date: date.toISOString(),
      productId: `PROD-${idNum % 10 + 1}`,
      sku: productSku,
      productName: productName,
      quantity: quantity,
      type: type,
      reference: type === 'sale' ? `TX-${(200000 + idNum).toString().slice(-6)}` : 
                type === 'purchase' ? `PO-${(300000 + idNum).toString().slice(-6)}` : 
                type === 'return' ? `RT-${(400000 + idNum).toString().slice(-6)}` : 
                `ADJ-${(500000 + idNum).toString().slice(-6)}`,
      notes: `${type.charAt(0).toUpperCase() + type.slice(1)} transaction for ${productName}`
    };
    
    return json(transaction);
  } catch (error) {
    console.error(`Error fetching stock transaction ${params.id}:`, error);
    return json({ error: error instanceof Error ? error.message : 'Failed to fetch stock transaction' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const { id } = params;
    const data = await request.json();
    
    // In a real implementation, this would update the transaction in the database
    // For now, we'll simulate this with a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return json({ success: true, message: 'Stock transaction updated successfully' });
  } catch (error) {
    console.error(`Error updating stock transaction ${params.id}:`, error);
    return json({ error: error instanceof Error ? error.message : 'Failed to update stock transaction' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const { id } = params;
    
    // In a real implementation, this would delete the transaction from the database
    // For now, we'll simulate this with a delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return json({ success: true, message: 'Stock transaction deleted successfully' });
  } catch (error) {
    console.error(`Error deleting stock transaction ${params.id}:`, error);
    return json({ error: error instanceof Error ? error.message : 'Failed to delete stock transaction' }, { status: 500 });
  }
};
