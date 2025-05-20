import { drizzle } from 'drizzle-orm/d1';
import { eq, and, like, desc, sql } from 'drizzle-orm';
import { stockEntries, items } from '../db/schema';

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
interface CountResult {
  count: number;
}

interface StockEntryResult {
  id: string;
  item_id: string;
  store_id: string;
  type: string;
  quantity: number;
  unit: string;
  rate: number;
  supplier: string | null;
  invoice_number: string | null;
  entry_date: number | string | Date;
  created_at: number | string | Date;
  item_name: string;
  item_code: string;
}

export interface StockEntryData {
  item_id: string;
  quantity: number;
  unit: string;
  rate: number;
  type?: string;
  supplier?: string;
  invoice_number?: string;
  entry_date?: number;
}

export interface StockEntryWithItem extends StockEntryData {
  id: string;
  store_id: string;
  type: string;
  created_at: number;
  item_name: string;
  item_code: string;
}

export class StockEntryService {
  private db;
  private d1: D1Database;
  
  constructor(d1: D1Database) {
    this.db = drizzle(d1);
    this.d1 = d1; // Store the D1 client for direct access
  }
  
  /**
   * Get all stock entries with pagination and search
   */
  async getAllStockEntries(
    page = 1,
    limit = 10,
    search = ''
  ): Promise<{ stockEntries: StockEntryWithItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    // Calculate offset
    const offset = (page - 1) * limit;
    
    try {
      // Use direct SQL query for better compatibility with D1
      let queryStr = `
        SELECT 
          se.id, se.item_id, se.store_id, se.type, se.quantity, se.unit, 
          se.rate, se.supplier, se.invoice_number, se.entry_date, se.created_at,
          i.name as item_name, i.item_code as item_code
        FROM stock_entries se
        INNER JOIN items i ON se.item_id = i.id
      `;
      
      // Apply search filter if provided
      const params = [];
      if (search) {
        const searchTerm = `%${search}%`;
        queryStr += `
          WHERE i.name LIKE ? OR i.item_code LIKE ? OR 
          se.supplier LIKE ? OR se.invoice_number LIKE ?
        `;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      // Add ordering
      queryStr += ` ORDER BY se.entry_date DESC`;
      
      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as count FROM stock_entries`;
      const countResult = await this.d1.prepare(countQuery).all<CountResult>();
      const total = countResult.results?.[0]?.count || 0;
      
      // Add pagination
      queryStr += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
      
      // Execute the query
      const stmt = this.d1.prepare(queryStr);
      const results = await stmt.bind(...params).all<StockEntryResult>();
      
      // Convert Date objects to timestamps
      const formattedResults = (results.results || []).map(entry => ({
        id: entry.id,
        item_id: entry.item_id,
        store_id: entry.store_id,
        type: entry.type,
        quantity: entry.quantity,
        unit: entry.unit,
        rate: entry.rate,
        supplier: entry.supplier,
        invoice_number: entry.invoice_number,
        item_name: entry.item_name,
        item_code: entry.item_code,
        entry_date: typeof entry.entry_date === 'object' ? Math.floor((entry.entry_date as Date).getTime() / 1000) : Number(entry.entry_date),
        created_at: typeof entry.created_at === 'object' ? Math.floor((entry.created_at as Date).getTime() / 1000) : Number(entry.created_at)
      })) as StockEntryWithItem[];
      
      return {
        stockEntries: formattedResults,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in getAllStockEntries:', error);
      throw error;
    }
  }
  
  /**
   * Get a single stock entry by ID
   */
  async getStockEntryById(id: string): Promise<StockEntryWithItem | null> {
    try {
      // Use direct SQL query for better compatibility with D1
      const queryStr = `
        SELECT 
          se.id, se.item_id, se.store_id, se.type, se.quantity, se.unit, 
          se.rate, se.supplier, se.invoice_number, se.entry_date, se.created_at,
          i.name as item_name, i.item_code as item_code
        FROM stock_entries se
        INNER JOIN items i ON se.item_id = i.id
        WHERE se.id = ?
        LIMIT 1
      `;
      
      const result = await this.d1.prepare(queryStr).bind(id).all<StockEntryResult>();
      
      if (!result.results?.length) return null;
      
      // Convert Date objects to timestamps
      const entry = result.results[0];
      return {
        id: entry.id,
        item_id: entry.item_id,
        store_id: entry.store_id,
        type: entry.type,
        quantity: entry.quantity,
        unit: entry.unit,
        rate: entry.rate,
        supplier: entry.supplier,
        invoice_number: entry.invoice_number,
        item_name: entry.item_name,
        item_code: entry.item_code,
        entry_date: typeof entry.entry_date === 'object' ? Math.floor((entry.entry_date as Date).getTime() / 1000) : Number(entry.entry_date),
        created_at: typeof entry.created_at === 'object' ? Math.floor((entry.created_at as Date).getTime() / 1000) : Number(entry.created_at)
      } as StockEntryWithItem;
    } catch (error) {
      console.error('Error in getStockEntryById:', error);
      throw error;
    }
  }
  
  /**
   * Create a new stock entry
   */
  async createStockEntry(data: StockEntryData): Promise<{ id: string }> {
    try {
      // Validate data
      if (!data.item_id) {
        throw new Error('Item is required');
      }
      
      if (!data.quantity || data.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      
      if (!data.unit) {
        throw new Error('Unit is required');
      }
      
      if (!data.rate || data.rate < 0) {
        throw new Error('Rate must be a non-negative number');
      }
      
      // Check if item exists
      const itemExistsQuery = `SELECT id FROM items WHERE id = ? LIMIT 1`;
      const itemExists = await this.d1.prepare(itemExistsQuery).bind(data.item_id).all<{id: string}>();
      
      if (!itemExists.results?.length) {
        throw new Error('Selected item does not exist');
      }
      
      // Generate a UUID for the new entry
      const newId = crypto.randomUUID();
      
      // Create entry - using SQL directly for better compatibility with D1
      const entryDate = data.entry_date || Math.floor(Date.now() / 1000);
      const type = data.type || 'purchase';
      const supplier = data.supplier || null;
      const invoiceNumber = data.invoice_number || null;
      
      await this.db.run(sql`
        INSERT INTO stock_entries (id, item_id, store_id, type, quantity, unit, rate, supplier, invoice_number, entry_date)
        VALUES (
          ${newId},
          ${data.item_id},
          '1',
          ${type},
          ${data.quantity},
          ${data.unit},
          ${data.rate},
          ${supplier},
          ${invoiceNumber},
          ${entryDate}
        )
      `);
      
      return { id: newId };
    } catch (error) {
      console.error('Error in createStockEntry:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing stock entry
   */
  async updateStockEntry(id: string, data: Partial<StockEntryData>): Promise<{ success: boolean }> {
    try {
      // Validate data
      if (data.quantity !== undefined && data.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }
      
      if (data.rate !== undefined && data.rate < 0) {
        throw new Error('Rate must be a non-negative number');
      }
      
      // Check if item exists if item_id is being updated
      if (data.item_id) {
        const itemExistsQuery = `SELECT id FROM items WHERE id = ? LIMIT 1`;
        const itemExists = await this.d1.prepare(itemExistsQuery).bind(data.item_id).all<{id: string}>();
        
        if (!itemExists.results?.length) {
          throw new Error('Selected item does not exist');
        }
      }
      
      // Check if stock entry exists
      const entryExistsQuery = `SELECT id FROM stock_entries WHERE id = ? LIMIT 1`;
      const entryExists = await this.d1.prepare(entryExistsQuery).bind(id).all<{id: string}>();
      
      if (!entryExists.results?.length) {
        throw new Error('Stock entry not found');
      }
      
      // Build update query parts
      const updateParts = [];
      const params = [];
      
      if (data.item_id !== undefined) {
        updateParts.push('item_id = ?');
        params.push(data.item_id);
      }
      
      if (data.type !== undefined) {
        updateParts.push('type = ?');
        params.push(data.type);
      }
      
      if (data.quantity !== undefined) {
        updateParts.push('quantity = ?');
        params.push(data.quantity);
      }
      
      if (data.unit !== undefined) {
        updateParts.push('unit = ?');
        params.push(data.unit);
      }
      
      if (data.rate !== undefined) {
        updateParts.push('rate = ?');
        params.push(data.rate);
      }
      
      if (data.supplier !== undefined) {
        updateParts.push('supplier = ?');
        params.push(data.supplier);
      }
      
      if (data.invoice_number !== undefined) {
        updateParts.push('invoice_number = ?');
        params.push(data.invoice_number);
      }
      
      if (data.entry_date !== undefined) {
        updateParts.push('entry_date = ?');
        params.push(data.entry_date);
      }
      
      if (updateParts.length === 0) {
        return { success: true }; // Nothing to update
      }
      
      // Execute update query
      const updateQuery = `UPDATE stock_entries SET ${updateParts.join(', ')} WHERE id = ?`;
      params.push(id);
      
      await this.d1.prepare(updateQuery).bind(...params).run();
      
      return { success: true };
    } catch (error) {
      console.error('Error in updateStockEntry:', error);
      throw error;
    }
  }
  
  /**
   * Delete a stock entry
   */
  async deleteStockEntry(id: string): Promise<{ success: boolean }> {
    try {
      // Check if stock entry exists
      const entryExists = await this.db
        .select({ id: stockEntries.id })
        .from(stockEntries)
        .where(eq(stockEntries.id, id))
        .limit(1)
        .all();
      
      if (!entryExists.length) {
        throw new Error('Stock entry not found');
      }
      
      // Delete entry using SQL directly for better compatibility
      await this.d1.prepare(`DELETE FROM stock_entries WHERE id = ?`).bind(id).run();
      
      return { success: true };
    } catch (error) {
      console.error('Error in deleteStockEntry:', error);
      throw error;
    }
  }
}
