import { drizzle } from 'drizzle-orm/d1';
import { eq, like, or } from 'drizzle-orm';
import { itemGroups, items } from '../db/schema';

// D1Database interface for Cloudflare Workers
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

export class ItemGroupService {
  private db;

  constructor(d1: D1Database) {
    this.db = drizzle(d1);
  }

  /**
   * Get all item groups with pagination and search
   */
  async getAllItemGroups({ page = 1, limit = 10, search = '' }: { page?: number; limit?: number; search?: string }) {
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query
    let query = this.db.select({
      id: itemGroups.id,
      _id: itemGroups._id,
      name: itemGroups.name,
      code: itemGroups.code,
      created_at: itemGroups.created_at,
    }).from(itemGroups);
    
    // Add search condition if provided
    if (search) {
      query = query.where(
        or(
          like(itemGroups.name, `%${search}%`),
          like(itemGroups.code, `%${search}%`)
        )
      );
    }
    
    // Add pagination
    query = query.limit(limit).offset(offset);
    
    // Execute query
    const results = await query;
    
    // Get total count for pagination
    const countQuery = this.db.select({
      count: sql`count(*)`,
    }).from(itemGroups);
    
    // Add search condition to count query if provided
    if (search) {
      countQuery.where(
        or(
          like(itemGroups.name, `%${search}%`),
          like(itemGroups.code, `%${search}%`)
        )
      );
    }
    
    const countResult = await countQuery;
    const total = Number(countResult[0]?.count || 0);
    
    return {
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single item group by ID
   */
  async getItemGroupById(id: string) {
    const result = await this.db
      .select()
      .from(itemGroups)
      .where(eq(itemGroups.id, id));
    
    return result[0] || null;
  }

  /**
   * Create a new item group
   */
  async createItemGroup(data: { name: string; code: string }) {
    // Validate data
    if (!data.name || !data.code) {
      throw new Error('Name and code are required');
    }
    
    // Check if name or code already exists
    const existing = await this.db
      .select()
      .from(itemGroups)
      .where(
        or(
          eq(itemGroups.name, data.name),
          eq(itemGroups.code, data.code)
        )
      );
    
    if (existing.length > 0) {
      if (existing[0].name === data.name) {
        throw new Error('An item group with this name already exists');
      } else {
        throw new Error('An item group with this code already exists');
      }
    }
    
    // Create the item group
    const result = await this.db.insert(itemGroups).values({
      name: data.name,
      code: data.code,
    }).returning();
    
    return result[0];
  }

  /**
   * Update an existing item group
   */
  async updateItemGroup(id: string, data: { name?: string; code?: string }) {
    // Validate data
    if (!data.name && !data.code) {
      throw new Error('Name or code must be provided');
    }
    
    // Check if the item group exists
    const existing = await this.getItemGroupById(id);
    if (!existing) {
      throw new Error('Item group not found');
    }
    
    // Check if name or code already exists (excluding the current item group)
    if (data.name || data.code) {
      const conditions = [];
      
      if (data.name) {
        conditions.push(eq(itemGroups.name, data.name));
      }
      
      if (data.code) {
        conditions.push(eq(itemGroups.code, data.code));
      }
      
      const duplicates = await this.db
        .select()
        .from(itemGroups)
        .where(
          and(
            or(...conditions),
            not(eq(itemGroups.id, id))
          )
        );
      
      if (duplicates.length > 0) {
        if (data.name && duplicates[0].name === data.name) {
          throw new Error('An item group with this name already exists');
        } else {
          throw new Error('An item group with this code already exists');
        }
      }
    }
    
    // Update the item group
    const result = await this.db
      .update(itemGroups)
      .set({
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
      })
      .where(eq(itemGroups.id, id))
      .returning();
    
    return result[0];
  }

  /**
   * Delete an item group
   */
  async deleteItemGroup(id: string) {
    // Check if the item group exists
    const existing = await this.getItemGroupById(id);
    if (!existing) {
      throw new Error('Item group not found');
    }
    
    // Check if there are any items using this item group
    const relatedItems = await this.db
      .select()
      .from(items)
      .where(eq(items.item_group_id, id))
      .limit(1);
    
    if (relatedItems.length > 0) {
      throw new Error('Cannot delete this item group because it is being used by one or more items');
    }
    
    // Delete the item group
    await this.db
      .delete(itemGroups)
      .where(eq(itemGroups.id, id));
    
    return { success: true };
  }
}

// Import sql for count query
import { sql } from 'drizzle-orm';
import { and, not } from 'drizzle-orm';
