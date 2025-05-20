import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { StockEntryService } from '$lib/server/services/stockEntryService';

export const GET: RequestHandler = async ({ params, platform }) => {
  try {
    const db = platform?.env?.DB;
    if (!db) {
      return json({ error: 'Database connection not available' }, { status: 500 });
    }
    
    const { id } = params;
    
    // Get stock entry by ID
    const stockEntryService = new StockEntryService(db);
    const stockEntry = await stockEntryService.getStockEntryById(id);
    
    if (!stockEntry) {
      return json({ error: 'Stock entry not found' }, { status: 404 });
    }
    
    return json(stockEntry);
  } catch (error) {
    console.error('Error fetching stock entry:', error);
    return json({ error: error instanceof Error ? error.message : 'Failed to fetch stock entry' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request, platform }) => {
  try {
    const db = platform?.env?.DB;
    if (!db) {
      return json({ error: 'Database connection not available' }, { status: 500 });
    }
    
    const { id } = params;
    const data = await request.json();
    
    // Update stock entry
    const stockEntryService = new StockEntryService(db);
    const result = await stockEntryService.updateStockEntry(id, data);
    
    return json(result);
  } catch (error) {
    console.error('Error updating stock entry:', error);
    return json({ error: error instanceof Error ? error.message : 'Failed to update stock entry' }, { status: 400 });
  }
};

export const DELETE: RequestHandler = async ({ params, platform }) => {
  try {
    const db = platform?.env?.DB;
    if (!db) {
      return json({ error: 'Database connection not available' }, { status: 500 });
    }
    
    const { id } = params;
    
    // Delete stock entry
    const stockEntryService = new StockEntryService(db);
    const result = await stockEntryService.deleteStockEntry(id);
    
    return json(result);
  } catch (error) {
    console.error('Error deleting stock entry:', error);
    return json({ error: error instanceof Error ? error.message : 'Failed to delete stock entry' }, { status: 400 });
  }
};
