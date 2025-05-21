import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { productService } from '$lib/server/services/pos/productService';

export const GET: RequestHandler = async ({ url, platform }) => {
  try {
    // Get query parameters
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    
    // Get products with pagination
    const result = await productService.getProducts(page, limit, search);
    
    return json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return json({ error: 'Failed to fetch products' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, platform }) => {
  try {
    // This would handle product creation in a real implementation
    // For now, we'll return a mock response
    return json({ success: true, message: 'Product created successfully' });
  } catch (error) {
    console.error('Error creating product:', error);
    return json({ error: 'Failed to create product' }, { status: 500 });
  }
};
