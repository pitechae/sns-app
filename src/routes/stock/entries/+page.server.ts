import type { PageServerLoad } from './$types';
import { ItemService } from '$lib/server/services/itemService';

export const load: PageServerLoad = async ({ url, platform }) => {
  const db = platform?.env?.DB;
  if (!db) {
    throw new Error('Database connection not available');
  }
  
  // Get query parameters
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  
  // Get items for the dropdown
  const itemService = new ItemService(db);
  const itemsResult = await itemService.getAllItems(1, 1000, ''); // Get all items for dropdown
  
  return {
    items: itemsResult.items,
    searchParams: { page, limit, search }
  };
};
