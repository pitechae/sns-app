import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { Product } from '$lib/types/pos';

// Define mock products for barcode lookup
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
    id: 'bts128-1',
    name: "BOY'S SHORT PANT - SLIM FIT",
    price: 12.00,
    category: "BOY'S SHORT PANT",
    barcode: 'BTS128',
    sku: 'BTS128',
    image: undefined,
    inStock: 75
  },
  {
    id: 'bps18-1',
    name: "BOY'S POLO SHIRT - PREMIUM",
    price: 28.00,
    category: "BOY'S POLO SHIRT",
    barcode: 'BPS18',
    sku: 'BPS18',
    image: undefined,
    inStock: 45
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

/**
 * Find a product by its barcode or SKU
 */
function findProductByCode(code: string): Product | undefined {
  // First try exact match
  let product = mockProducts.find(p => 
    p.barcode === code || 
    p.sku === code
  );
  
  // If no exact match, try partial match
  if (!product) {
    product = mockProducts.find(p => 
      (p.barcode && p.barcode.includes(code)) || 
      (p.sku && p.sku.includes(code))
    );
  }
  
  return product;
}

export const GET: RequestHandler = async ({ params }) => {
  // Ensure code is a string and not undefined
  const code = params.code || '';
  
  try {
    console.log(`Looking up product with barcode/code: ${code}`);
    
    // First try to find the product using the product service if available
    try {
      // This import is dynamic to avoid errors if the service doesn't exist
      const { productService } = await import('$lib/server/services/pos/productService');
      const product = await productService.getProductByBarcode(code);
      
      if (product) {
        // Product name is guaranteed to be a string based on the Product interface
        console.log(`Found product via service: ${product.name}`);
        return json(product);
      }
    } catch (serviceError) {
      console.log('Product service not available, falling back to mock data');
      // Continue to fallback methods if service is not available
    }
    
    // Fallback to mock data
    const product = findProductByCode(code);
    
    if (product) {
      // Product name is guaranteed to be a string based on the Product interface
      console.log(`Found product in mock data: ${product.name}`);
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
