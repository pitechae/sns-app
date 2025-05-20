import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { items, itemGroups } from '../db/schema';

// Import D1Database type from Cloudflare Workers types
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec<T = unknown>(query: string): Promise<D1Result<T>>;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta: object;
}

// Define interfaces for query results
interface ItemResult {
  id: string;
  _id: number;
  item_code: string;
  name: string;
  item_group_id: string;
  created_at: number | string | Date;
  groupName: string;
  groupCode: string;
}

export class ItemService {
  private db;
  private d1: D1Database;

  constructor(d1: D1Database) {
    this.db = drizzle(d1);
    this.d1 = d1; // Store the D1 client for direct access
  }

  async getAllItems(page = 1, limit = 10, search = '') {
    try {
      // Use direct SQL query for better compatibility with D1
      let queryStr = `
        SELECT 
          i.id, i._id, i.item_code, i.name, i.item_group_id, i.created_at,
          ig.name as groupName, ig.code as groupCode
        FROM items i
        LEFT JOIN item_groups ig ON i.item_group_id = ig.id
      `;
      
      // Apply search filter if provided
      const params = [];
      if (search) {
        const searchTerm = `%${search}%`;
        queryStr += `
          WHERE i.name LIKE ? OR i.item_code LIKE ? OR 
          ig.name LIKE ? OR ig.code LIKE ?
        `;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      // Add ordering
      queryStr += ` ORDER BY i.name ASC`;
      
      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as count FROM items`;
      const countResult = await this.d1.prepare(countQuery).all<{count: number}>();
      const total = countResult.results?.[0]?.count || 0;
      
      // Add pagination
      const offset = (page - 1) * limit;
      queryStr += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
      
      // Execute the query
      const stmt = this.d1.prepare(queryStr);
      const result = await stmt.bind(...params).all<ItemResult>();
      
      // Format results
      const items = (result.results || []).map(item => ({
        id: item.id,
        _id: item._id,
        item_code: item.item_code,
        name: item.name,
        item_group_id: item.item_group_id,
        created_at: typeof item.created_at === 'object' ? Math.floor((item.created_at as Date).getTime() / 1000) : Number(item.created_at),
        groupName: item.groupName,
        groupCode: item.groupCode
      }));
      
      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in getAllItems:', error);
      throw error;
    }
  }

  async getItemById(id: string) {
    try {
      const queryStr = `
        SELECT * FROM items WHERE id = ? LIMIT 1
      `;
      
      const result = await this.d1.prepare(queryStr).bind(id).all();
      
      return result.results?.[0] || null;
    } catch (error) {
      console.error('Error in getItemById:', error);
      throw error;
    }
  }

  async createItem(data: { item_code: string; item_group_id: string }) {
    try {
      // Check if item code already exists
      const checkItemQuery = `SELECT * FROM items WHERE item_code = ? LIMIT 1`;
      const existingItem = await this.d1.prepare(checkItemQuery).bind(data.item_code).all();
      
      if (existingItem.results?.length) {
        throw new Error(`Item with code ${data.item_code} already exists`);
      }
      
      // Get the item group to retrieve its name
      const itemGroupQuery = `SELECT * FROM item_groups WHERE id = ? LIMIT 1`;
      const itemGroupResult = await this.d1.prepare(itemGroupQuery).bind(data.item_group_id).all();
      
      if (!itemGroupResult.results?.length) {
        throw new Error(`Item group with ID ${data.item_group_id} not found`);
      }
      
      const itemGroup = itemGroupResult.results[0] as { name: string, code: string };
      
      // Generate a UUID for the new item
      const newId = crypto.randomUUID();
      
      // Create a name based on the item group name and code
      const itemName = itemGroup.name;
      
      // Use the item group's name for the item's name
      const insertQuery = `
        INSERT INTO items (id, item_code, item_group_id, name)
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await this.d1.prepare(insertQuery).bind(
        newId,
        data.item_code,
        data.item_group_id,
        itemName
      ).run();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to insert item');
      }
      
      // Return the newly created item with additional information
      return { 
        id: newId, 
        item_code: data.item_code,
        item_group_id: data.item_group_id,
        name: itemName,
        groupName: itemGroup.name,
        groupCode: itemGroup.code,
        created_at: Math.floor(Date.now() / 1000)
      };
    } catch (error) {
      console.error('Error in createItem:', error);
      throw error;
    }
  }

  async getAllItemGroups() {
    try {
      const query = `SELECT * FROM item_groups ORDER BY name ASC`;
      const result = await this.d1.prepare(query).all();
      
      return result.results || [];
    } catch (error) {
      console.error('Error in getAllItemGroups:', error);
      throw error;
    }
  }
}
