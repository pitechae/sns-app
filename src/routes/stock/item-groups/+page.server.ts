import { ItemGroupService } from '$lib/server/services/itemGroupService';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, platform }) => {
  // Get query parameters
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const search = url.searchParams.get('search') || '';
  
  // Get the D1 database from platform bindings
  const db = platform.env.DB;
  const itemGroupService = new ItemGroupService(db);
  
  // Get item groups with pagination and search
  const { data: itemGroups, pagination } = await itemGroupService.getAllItemGroups({ 
    page, 
    limit, 
    search 
  });
  
  return {
    itemGroups,
    pagination,
    search
  };
};
