/**
 * Mock database implementation for the POS system
 * In a real application, this would be replaced with a real database connection
 */

// Mock database class
export class Database {
  private data: Record<string, any[]> = {
    products: [],
    transactions: [],
    printers: []
  };

  /**
   * Get all records from a collection
   */
  async getAll(collection: string): Promise<any[]> {
    return this.data[collection] || [];
  }

  /**
   * Get a record by ID
   */
  async getById(collection: string, id: string): Promise<any | null> {
    const items = this.data[collection] || [];
    return items.find(item => item.id === id) || null;
  }

  /**
   * Insert a record
   */
  async insert(collection: string, item: any): Promise<any> {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(item);
    return item;
  }

  /**
   * Update a record
   */
  async update(collection: string, id: string, updates: any): Promise<any | null> {
    const items = this.data[collection] || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      return null;
    }
    
    this.data[collection][index] = { ...items[index], ...updates };
    return this.data[collection][index];
  }

  /**
   * Delete a record
   */
  async delete(collection: string, id: string): Promise<boolean> {
    const items = this.data[collection] || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      return false;
    }
    
    this.data[collection].splice(index, 1);
    return true;
  }

  /**
   * Query records with a filter function
   */
  async query(collection: string, filterFn: (item: any) => boolean): Promise<any[]> {
    const items = this.data[collection] || [];
    return items.filter(filterFn);
  }
}

// Export a singleton instance of the database
export const db = new Database();
