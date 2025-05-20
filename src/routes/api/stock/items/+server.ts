import { json } from '@sveltejs/kit';
import { ItemService } from '$lib/server/services/itemService';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.item_code || !data.item_group_id) {
      return json({ error: 'Item code and item group are required' }, { status: 400 });
    }
    
    // Check if platform and DB are available
    if (!platform?.env?.DB) {
      return json({ error: 'Database not available' }, { status: 500 });
    }
    
    // Create the item
    const db = platform.env.DB;
    const itemService = new ItemService(db);
    const newItem = await itemService.createItem({
      item_code: data.item_code,
      item_group_id: data.item_group_id
    });
    
    return json({ item: newItem });
  } catch (error) {
    console.error('Error creating item:', error);
    return json({ error: 'Failed to create item' }, { status: 500 });
  }
};

export const GET: RequestHandler = async ({ platform, url }) => {
  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10'); // Changed default to 10 to match pagination
    const search = url.searchParams.get('search') || '';
    
    if (!platform?.env?.DB) {
      return json({ error: 'Database not available' }, { status: 500 });
    }
    
    const db = platform.env.DB;
    const itemService = new ItemService(db);
    const result = await itemService.getAllItems(page, limit, search);
    
    // Return both items and pagination data
    return json({
      items: result.items,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    return json({ error: 'Failed to fetch items' }, { status: 500 });
  }
};
