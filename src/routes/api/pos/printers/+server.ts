import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { receiptService } from '$lib/server/services/pos/receiptService';
import { transactionService } from '$lib/server/services/pos/transactionService';
import type { BusinessInfo } from '$lib/server/services/pos/receiptService';

export const GET: RequestHandler = async ({ platform }) => {
  try {
    // Get available printers
    const printers = await receiptService.getAvailablePrinters();
    
    return json({ printers });
  } catch (error) {
    console.error('Error fetching printers:', error);
    return json({ error: 'Failed to fetch printers' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, platform }) => {
  try {
    const data = await request.json();
    
    // Validate request data
    if (!data.transactionId) {
      return json({ error: 'Transaction ID is required' }, { status: 400 });
    }
    
    // Get transaction
    const transaction = await transactionService.getTransactionById(data.transactionId);
    
    if (!transaction) {
      return json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Business info for receipt
    const businessInfo: BusinessInfo = {
      name: data.businessName || 'SNS Store',
      address: data.businessAddress || '123 Main St, City, Country',
      phone: data.businessPhone || '+1 (555) 123-4567',
      email: data.businessEmail || 'info@snsstore.com'
    };
    
    // Print receipt
    const success = await receiptService.printReceipt(
      transaction,
      businessInfo,
      data.printerName
    );
    
    if (!success) {
      return json({ error: 'Failed to print receipt' }, { status: 500 });
    }
    
    return json({ success: true, message: 'Receipt printed successfully' });
  } catch (error) {
    console.error('Error printing receipt:', error);
    return json({ error: 'Failed to print receipt' }, { status: 500 });
  }
};
