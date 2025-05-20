import { json } from '@sveltejs/kit';
import { ItemService } from '$lib/server/services/itemService';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform, url }) => {
  try {
    const query = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    // Check if platform and DB are available
    if (!platform?.env?.DB) {
      return json({ error: 'Database not available' }, { status: 500 });
    }
    
    const db = platform.env.DB;
    const itemService = new ItemService(db);
    
    // Get item groups based on search query
    const itemGroups = await itemService.getAllItemGroups();
    
    // Filter item groups based on search query
    let filteredItemGroups = itemGroups;
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredItemGroups = itemGroups.filter(group => 
        group.name.toLowerCase().includes(lowerQuery) || 
        group.code.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Paginate results
    const total = filteredItemGroups.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItemGroups = filteredItemGroups.slice(startIndex, endIndex);
    
    return json({
      itemGroups: paginatedItemGroups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error searching item groups:', error);
    return json({ error: 'Failed to search item groups' }, { status: 500 });
  }
};
