import { json } from '@sveltejs/kit';
import { ItemGroupService } from '$lib/server/services/itemGroupService';
import type { RequestHandler } from './$types';

// GET handler for fetching a single item group
export const GET: RequestHandler = async ({ params, platform }) => {
  try {
    const { id } = params;
    
    // Get the D1 database from platform bindings
    const db = platform.env.DB;
    const itemGroupService = new ItemGroupService(db);
    
    // Get the item group
    const itemGroup = await itemGroupService.getItemGroupById(id);
    
    if (!itemGroup) {
      return json({ error: 'Item group not found' }, { status: 404 });
    }
    
    return json({ itemGroup });
  } catch (error) {
    console.error('Error fetching item group:', error);
    return json({ error: 'Failed to fetch item group' }, { status: 500 });
  }
};

// PUT handler for updating an item group
export const PUT: RequestHandler = async ({ params, request, platform }) => {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Validate data
    if (!data.name && !data.code) {
      return json({ error: 'Name or code must be provided' }, { status: 400 });
    }
    
    // Get the D1 database from platform bindings
    const db = platform.env.DB;
    const itemGroupService = new ItemGroupService(db);
    
    try {
      // Update the item group
      const updatedItemGroup = await itemGroupService.updateItemGroup(id, {
        name: data.name,
        code: data.code
      });
      
      return json({ itemGroup: updatedItemGroup });
    } catch (error) {
      if (error instanceof Error) {
        // Check if it's a not found error
        if (error.message === 'Item group not found') {
          return json({ error: error.message }, { status: 404 });
        }
        
        return json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating item group:', error);
    return json({ error: 'Failed to update item group' }, { status: 500 });
  }
};

// DELETE handler for deleting an item group
export const DELETE: RequestHandler = async ({ params, platform }) => {
  try {
    const { id } = params;
    
    // Get the D1 database from platform bindings
    const db = platform.env.DB;
    const itemGroupService = new ItemGroupService(db);
    
    try {
      // Delete the item group
      await itemGroupService.deleteItemGroup(id);
      
      return json({ success: true });
    } catch (error) {
      if (error instanceof Error) {
        // Check if it's a not found error
        if (error.message === 'Item group not found') {
          return json({ error: error.message }, { status: 404 });
        }
        
        // Check if it's a constraint error
        if (error.message.includes('being used by one or more items')) {
          return json({ error: error.message }, { status: 409 }); // Conflict
        }
        
        return json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting item group:', error);
    return json({ error: 'Failed to delete item group' }, { status: 500 });
  }
};
