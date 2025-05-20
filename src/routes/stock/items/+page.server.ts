import { ItemService } from '$lib/server/services/itemService';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
  // Get the D1 database from platform bindings
  if (!platform?.env?.DB) {
    console.error('Database not available');
    return {
      items: [],
      itemGroups: []
    };
  }
  
  const db = platform.env.DB;
  const itemService = new ItemService(db);

  try {
    // Get all items and item groups
    const itemsResult = await itemService.getAllItems();
    const itemGroups = await itemService.getAllItemGroups();

    // Transform the items to match the expected format in the ItemsTable component
    const transformedItems = itemsResult.items.map(item => ({
      id: item.id,
      itemCode: item.item_code,
      name: item.name,
      groupName: item.groupName,
      groupCode: item.groupCode,
      createdAt: item.created_at
    }));

    return {
      items: transformedItems,
      itemGroups
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      items: [],
      itemGroups: []
    };
  }
};
