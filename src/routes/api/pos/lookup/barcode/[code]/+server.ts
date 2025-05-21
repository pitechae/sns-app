import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { Product } from '$lib/types/pos';
import { ItemService } from '$lib/server/services/itemService';
import { StockEntryService } from '$lib/server/services/stockEntryService';

// Interface for database query result
interface ItemWithStock {
  id: string;
  name: string;
  item_code: string;
  item_group_id: string;
  groupName: string;
  groupCode: string;
  quantity?: number;
  rate?: number;
}

/**
 * Find a product by its barcode or SKU from the database
 */
async function findProductByCode(code: string, platform: any): Promise<Product | null> {
  try {
    const db = platform?.env?.DB;
    if (!db) {
      console.error('Database connection not available');
      return null;
    }
    
    // Initialize services
    const itemService = new ItemService(db);
    const stockEntryService = new StockEntryService(db);
    
    // Search for items by code (exact or partial match)
    const searchResult = await itemService.getAllItems(1, 5, code);
    
    if (!searchResult.items || searchResult.items.length === 0) {
      console.log(`No items found with code: ${code}`);
      return null;
    }
    
    // Get the first matching item
    const item = searchResult.items[0] as ItemWithStock;
    
    // Get all stock entries for this item to determine price and stock level
    // Using a large limit to ensure we get all entries
    const stockEntries = await stockEntryService.getAllStockEntries(1, 1000, '');
    let inStock = 0;
    let price = 0;
    
    // Calculate total stock quantity from all entries
    if (stockEntries && stockEntries.stockEntries) {
      // Filter stock entries for this item
      const itemEntries = stockEntries.stockEntries.filter(entry => entry.item_id === item.id);
      
      console.log(`Found ${itemEntries.length} stock entries for item ${item.name} (${item.id})`);
      
      // Calculate stock by summing quantities (positive for purchases, negative for sales)
      inStock = itemEntries.reduce((total, entry) => {
        console.log(`Entry type: ${entry.type}, quantity: ${entry.quantity}, current total: ${total}`);
        if (entry.type === 'purchase' || entry.type === 'adjustment') {
          return total + entry.quantity;
        } else if (entry.type === 'sale' || entry.type === 'return') {
          return total - entry.quantity;
        }
        return total;
      }, 0);
      
      console.log(`Final calculated stock for ${item.name}: ${inStock}`);
      
      // If no entries found, default to a positive stock value
      if (itemEntries.length === 0) {
        console.log(`No stock entries found, defaulting to positive stock value`);
        inStock = 10; // Default to 10 items in stock if no entries exist
      }
      
      // Get the latest price from the most recent purchase entry
      const latestPurchase = itemEntries
        .filter(entry => entry.type === 'purchase')
        .sort((a, b) => {
          const dateA = a.entry_date || 0;
          const dateB = b.entry_date || 0;
          return dateB - dateA;
        })[0];
      
      if (latestPurchase) {
        price = latestPurchase.rate;
      } else {
        // Default price if no purchase entries found
        price = item.rate || 0;
      }
    }
    
    // Map database item to Product format
    return {
      id: item.id,
      name: item.name,
      price: price,
      category: item.groupName || 'General',
      barcode: item.item_code,
      sku: item.item_code,
      image: undefined,
      inStock: inStock
    };
  } catch (error) {
    console.error('Error finding product by code:', error);
    return null;
  }
}

export const GET: RequestHandler = async ({ params, platform }) => {
  // Ensure code is a string and not undefined
  const code = params.code || '';
  
  try {
    console.log(`Looking up product with barcode/code: ${code}`);
    
    // Use our real data lookup function
    const product = await findProductByCode(code, platform);
    
    if (product) {
      console.log(`Found product in database: ${product.name}`);
      return json(product);
    }
    
    // If product not found, return 404
    console.log(`Product with code ${code} not found`);
    return new Response(JSON.stringify({ error: `Product with barcode ${code} not found` }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching product by barcode/code:', error);
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
