import { db } from '$lib/server/database';
import type { Product } from '$lib/types/pos';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service for handling products in the POS system
 */
export class ProductService {
  /**
   * Get all products with optional filtering and pagination
   */
  async getProducts(page = 1, limit = 20, search = ''): Promise<{ products: Product[], pagination: { page: number, limit: number, total: number, totalPages: number } }> {
    // In a real implementation, this would fetch products from the database
    // For now, we'll generate mock data
    const products: Product[] = [
      { id: '1', name: 'Coffee', price: 3.50, category: 'Beverages', barcode: '1234567890', image: '/images/products/coffee.png', inStock: 100 },
      { id: '2', name: 'Tea', price: 2.50, category: 'Beverages', barcode: '2345678901', image: '/images/products/tea.png', inStock: 150 },
      { id: '3', name: 'Sandwich', price: 5.99, category: 'Food', barcode: '3456789012', image: '/images/products/sandwich.png', inStock: 25 },
      { id: '4', name: 'Salad', price: 6.99, category: 'Food', barcode: '4567890123', image: '/images/products/salad.png', inStock: 15 },
      { id: '5', name: 'Muffin', price: 2.99, category: 'Bakery', barcode: '5678901234', image: '/images/products/muffin.png', inStock: 40 },
      { id: '6', name: 'Croissant', price: 2.49, category: 'Bakery', barcode: '6789012345', image: '/images/products/croissant.png', inStock: 35 },
      { id: '7', name: 'Juice', price: 3.99, category: 'Beverages', barcode: '7890123456', image: '/images/products/juice.png', inStock: 80 },
      { id: '8', name: 'Water', price: 1.50, category: 'Beverages', barcode: '8901234567', image: '/images/products/water.png', inStock: 200 },
      { id: '9', name: 'Chips', price: 1.99, category: 'Snacks', barcode: '9012345678', image: '/images/products/chips.png', inStock: 60 },
      { id: '10', name: 'Chocolate Bar', price: 1.79, category: 'Snacks', barcode: '0123456789', image: '/images/products/chocolate.png', inStock: 75 },
      { id: '11', name: 'Bagel', price: 2.29, category: 'Bakery', barcode: '1122334455', image: '/images/products/bagel.png', inStock: 30 },
      { id: '12', name: 'Soda', price: 1.99, category: 'Beverages', barcode: '2233445566', image: '/images/products/soda.png', inStock: 90 },
      { id: '13', name: 'Protein Bar', price: 2.99, category: 'Snacks', barcode: '3344556677', image: '/images/products/protein-bar.png', inStock: 45 },
      { id: '14', name: 'Yogurt', price: 1.89, category: 'Dairy', barcode: '4455667788', image: '/images/products/yogurt.png', inStock: 50 },
      { id: '15', name: 'Fruit Cup', price: 3.49, category: 'Food', barcode: '5566778899', image: '/images/products/fruit-cup.png', inStock: 20 },
      { id: '16', name: 'Granola Bar', price: 1.49, category: 'Snacks', barcode: '6677889900', image: '/images/products/granola-bar.png', inStock: 65 },
      { id: '17', name: 'Milk', price: 2.79, category: 'Dairy', barcode: '7788990011', image: '/images/products/milk.png', inStock: 40 },
      { id: '18', name: 'Cookies', price: 2.49, category: 'Bakery', barcode: '8899001122', image: '/images/products/cookies.png', inStock: 55 },
      { id: '19', name: 'Iced Coffee', price: 4.50, category: 'Beverages', barcode: '9900112233', image: '/images/products/iced-coffee.png', inStock: 30 },
      { id: '20', name: 'Energy Drink', price: 3.99, category: 'Beverages', barcode: '0011223344', image: '/images/products/energy-drink.png', inStock: 70 },
    ];
    
    // Filter products if search is provided
    let filteredProducts = products;
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(lowerSearch) || 
        product.category.toLowerCase().includes(lowerSearch) ||
        product.barcode.includes(search)
      );
    }
    
    // Apply pagination
    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    return {
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
  
  /**
   * Get a product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    // In a real implementation, this would fetch the product from the database
    const products = await this.getProducts();
    return products.products.find(product => product.id === id) || null;
  }
  
  /**
   * Get a product by barcode
   */
  async getProductByBarcode(barcode: string): Promise<Product | null> {
    // In a real implementation, this would fetch the product from the database
    const products = await this.getProducts();
    return products.products.find(product => product.barcode === barcode) || null;
  }
  
  /**
   * Update product stock
   */
  async updateStock(productId: string, quantity: number): Promise<void> {
    // In a real implementation, this would update the product stock in the database
    // For now, we'll simulate this with a delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

export const productService = new ProductService();
