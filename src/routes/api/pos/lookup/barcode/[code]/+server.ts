import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { Product } from '$lib/types/pos';

export const GET = async ({ params }) => {
  const { code } = params;
  
  try {
    // First try to find the product using the product service if available
    try {
      // This import is dynamic to avoid errors if the service doesn't exist
      const { productService } = await import('$lib/server/services/pos/productService');
      const product = await productService.getProductByBarcode(code);
      
      if (product) {
        return json(product);
      }
    } catch (serviceError) {
      console.log('Product service not available, falling back to stock API');
      // Continue to fallback methods if service is not available
    }
    
    // Fallback: Try to find the product in the stock entries
    const stockResponse = await fetch(`http://localhost:5173/api/stock/entries?search=${code}`);
    
    if (stockResponse.ok) {
      const stockData = await stockResponse.json();
      
      if (stockData.entries && stockData.entries.length > 0) {
        // Find the entry with matching barcode/itemCode
        const entry = stockData.entries.find((e: any) => 
          e.itemCode === code || 
          e.barcode === code
        );
        
        if (entry) {
          // Map stock entry to product format
          const sku = entry.itemCode || code;
          const category = sku.substring(0, 3) === 'BPS' ? "BOY'S POLO SHIRT" : 
                         sku.substring(0, 3) === 'BTS' ? "BOY'S SHORT PANT" : 
                         sku.substring(0, 3) === 'MH' ? "MEN'S HOODY" : 'General';
          
          const product: Product = {
            id: entry.id || `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            name: entry.itemName || 'Unnamed Product',
            price: typeof entry.rate === 'number' ? entry.rate : 23.00,
            category: category,
            barcode: code,
            sku: sku,
            image: undefined,
            inStock: typeof entry.quantity === 'number' ? entry.quantity : 0
          };
          
          return json(product);
        }
      }
    }
    
    // Fallback: Use mock data if not found in stock entries
    const mockProducts = [
      {
        id: 'bps30-1',
        name: "BOY'S POLO SHIRT",
        price: 23.00,
        category: "BOY'S POLO SHIRT",
        barcode: 'BPS30',
        sku: 'BPS30',
        image: undefined,
        inStock: 100
      },
      {
        id: 'bts140-1',
        name: "BOY'S SHORT PANT",
        price: 10.00,
        category: "BOY'S SHORT PANT",
        barcode: 'BTS140',
        sku: 'BTS140',
        image: undefined,
        inStock: 1100
      },
      {
        id: 'mh40-1',
        name: "MEN'S HOODY",
        price: 42.00,
        category: "MEN'S WEAR",
        barcode: 'MH40',
        sku: 'MH40',
        image: undefined,
        inStock: 50
      }
    ];
    
    // Find product with matching barcode
    const product = mockProducts.find(p => p.barcode === code || p.sku === code);
    
    if (product) {
      return json(product);
    }
    
    // If product not found, return 404
    return new Response(JSON.stringify({ error: 'Product not found' }), {
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
