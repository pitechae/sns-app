import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { StockEntryService } from '$lib/server/services/stockEntryService';

export const GET: RequestHandler = async ({ url, platform }) => {
  try {
    const db = platform?.env?.DB;
    if (!db) {
      return json({ error: 'Database connection not available' }, { status: 500 });
    }
    
    // Get query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    
    // Get stock entries
    const stockEntryService = new StockEntryService(db);
    const result = await stockEntryService.getAllStockEntries(page, limit, search);
    
    return json(result);
  } catch (error) {
    console.error('Error fetching stock entries:', error);
    return json({ error: error instanceof Error ? error.message : 'Failed to fetch stock entries' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, platform }) => {
  try {
    const db = platform?.env?.DB;
    if (!db) {
      return json({ error: 'Database connection not available' }, { status: 500 });
    }
    
    // Parse request body
    const data = await request.json();
    
    // Create stock entry
    const stockEntryService = new StockEntryService(db);
    const result = await stockEntryService.createStockEntry(data);
    
    return json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating stock entry:', error);
    return json({ error: error instanceof Error ? error.message : 'Failed to create stock entry' }, { status: 400 });
  }
};
