import { json } from '@sveltejs/kit';
import { ItemGroupService } from '$lib/server/services/itemGroupService';
import type { RequestHandler } from './$types';

// GET handler for fetching item groups with pagination and search
export const GET: RequestHandler = async ({ url, platform }) => {
  try {
    // Get query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    
    // Get the D1 database from platform bindings
    const db = platform.env.DB;
    const itemGroupService = new ItemGroupService(db);
    
    // Get item groups with pagination and search
    const result = await itemGroupService.getAllItemGroups({ page, limit, search });
    
    return json(result);
  } catch (error) {
    console.error('Error fetching item groups:', error);
    return json({ error: 'Failed to fetch item groups' }, { status: 500 });
  }
};

// POST handler for creating a new item group
export const POST: RequestHandler = async ({ request, platform }) => {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.code) {
      return json({ error: 'Name and code are required' }, { status: 400 });
    }
    
    // Create the item group
    const db = platform.env.DB;
    const itemGroupService = new ItemGroupService(db);
    
    try {
      const newItemGroup = await itemGroupService.createItemGroup({
        name: data.name,
        code: data.code
      });
      
      return json({ itemGroup: newItemGroup });
    } catch (error) {
      if (error instanceof Error) {
        return json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating item group:', error);
    return json({ error: 'Failed to create item group' }, { status: 500 });
  }
};
