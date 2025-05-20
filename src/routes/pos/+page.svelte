<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  
  // POS state
  let cart = $state<CartItem[]>([]);
  let products = $state<Product[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state('');
  let total = $derived(calculateTotal(cart));
  let activeCategory = $state<string | null>(null);
  let categories = $state<string[]>([]);
  
  // Types
  type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
  };
  
  type CartItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  };
  
  // Load products (mock data for now)
  onMount(() => {
    // Simulate API call
    setTimeout(() => {
      products = [
        { id: '1', name: 'Coffee', price: 3.50, category: 'Beverages' },
        { id: '2', name: 'Tea', price: 2.50, category: 'Beverages' },
        { id: '3', name: 'Sandwich', price: 5.99, category: 'Food' },
        { id: '4', name: 'Salad', price: 6.99, category: 'Food' },
        { id: '5', name: 'Muffin', price: 2.99, category: 'Bakery' },
        { id: '6', name: 'Croissant', price: 2.49, category: 'Bakery' },
        { id: '7', name: 'Juice', price: 3.99, category: 'Beverages' },
        { id: '8', name: 'Water', price: 1.50, category: 'Beverages' },
        { id: '9', name: 'Chips', price: 1.99, category: 'Snacks' },
        { id: '10', name: 'Chocolate Bar', price: 1.79, category: 'Snacks' },
        { id: '11', name: 'Bagel', price: 2.29, category: 'Bakery' },
        { id: '12', name: 'Soda', price: 1.99, category: 'Beverages' },
      ];
      
      // Extract unique categories
      categories = [...new Set(products.map(p => p.category))];
      
      isLoading = false;
    }, 800);
  });
  
  // Filter products based on search and category
  const filteredProducts = $derived(
    products.filter(product => {
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === null || 
        product.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
  );
  
  // Add item to cart
  function addToCart(product: Product) {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Update quantity if item already in cart
      cart = cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
    } else {
      // Add new item to cart
      cart = [...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      }];
    }
  }
  
  // Update item quantity
  function updateQuantity(productId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      cart = cart.filter(item => item.productId !== productId);
    } else {
      // Update quantity
      cart = cart.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      );
    }
  }
  
  // Remove item from cart
  function removeFromCart(productId: string) {
    cart = cart.filter(item => item.productId !== productId);
  }
  
  // Clear cart
  function clearCart() {
    cart = [];
  }
  
  // Calculate total
  function calculateTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  // Format price
  function formatPrice(price: number): string {
    return price.toFixed(2);
  }
  
  // Process payment
  function processPayment() {
    if (cart.length === 0) return;
    
    // In a real app, this would call an API to process the payment
    alert(`Payment processed for $${formatPrice(total)}`);
    
    // Clear cart after successful payment
    clearCart();
  }
</script>

<svelte:head>
  <title>POS Terminal | SNS App</title>
  <meta name="description" content="Point of Sale Terminal" />
</svelte:head>

<div class="w-full max-w-screen-2xl mx-auto p-4">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Product selection (2/3 width on large screens) -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Search and categories -->
      <div class="bg-base-100 border border-base-200 rounded-lg shadow-sm p-4">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search input -->
          <div class="form-control flex-1">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Search products..." 
                class="input input-bordered w-full pl-10" 
                bind:value={searchQuery}
              />
              {#if searchQuery}
                <button 
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/40 hover:text-base-content"
                  onclick={() => searchQuery = ''}
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              {/if}
            </div>
          </div>
        </div>
        
        <!-- Categories -->
        <div class="flex flex-wrap gap-2 mt-4">
          <button 
            class="btn btn-sm {activeCategory === null ? 'btn-primary' : 'btn-ghost'}"
            onclick={() => activeCategory = null}
          >
            All
          </button>
          {#each categories as category}
            <button 
              class="btn btn-sm {activeCategory === category ? 'btn-primary' : 'btn-ghost'}"
              onclick={() => activeCategory = category}
            >
              {category}
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Products grid -->
      <div class="bg-base-100 border border-base-200 rounded-lg shadow-sm p-4">
        {#if isLoading}
          <div class="flex justify-center items-center py-12">
            <div class="loading loading-spinner loading-lg text-primary"></div>
          </div>
        {:else if filteredProducts.length === 0}
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-lg font-medium">No products found</h3>
            <p class="text-base-content/60 mt-1">Try changing your search or category filter</p>
          </div>
        {:else}
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {#each filteredProducts as product (product.id)}
              <button 
                class="bg-base-100 border border-base-200 hover:border-primary/30 hover:bg-primary/5 rounded-lg p-3 text-center transition-all flex flex-col items-center justify-between h-full"
                onclick={() => addToCart(product)}
                in:fade={{ duration: 150 }}
                aria-label="Add {product.name} to cart"
              >
                <div class="w-full">
                  <div class="bg-base-200/50 rounded-lg h-16 w-16 mx-auto flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <h3 class="font-medium text-base-content truncate">{product.name}</h3>
                  <p class="text-primary font-semibold mt-1">${formatPrice(product.price)}</p>
                </div>
                <div class="mt-2 w-full">
                  <div class="text-xs text-base-content/60 mb-1">{product.category}</div>
                  <div class="btn btn-sm btn-primary btn-outline w-full">
                    Add to Cart
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Cart and checkout (1/3 width on large screens) -->
    <div class="lg:col-span-1">
      <div class="bg-base-100 border border-base-200 rounded-lg shadow-sm h-full flex flex-col">
        <!-- Cart header -->
        <div class="p-4 border-b border-base-200">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart
            </h2>
            {#if cart.length > 0}
              <button 
                class="btn btn-sm btn-ghost text-error"
                onclick={clearCart}
              >
                Clear All
              </button>
            {/if}
          </div>
        </div>
        
        <!-- Cart items -->
        <div class="flex-grow overflow-y-auto p-4 {cart.length === 0 ? 'flex items-center justify-center' : ''}">
          {#if cart.length === 0}
            <div class="text-center text-base-content/60 py-8">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-base">Your cart is empty</p>
              <p class="text-sm mt-1">Add items to get started</p>
            </div>
          {:else}
            <ul class="space-y-3">
              {#each cart as item (item.productId)}
                <li class="border border-base-200 rounded-lg p-3" in:fly={{ y: 10, duration: 200 }}>
                  <div class="flex justify-between">
                    <div>
                      <h4 class="font-medium">{item.name}</h4>
                      <p class="text-primary">${formatPrice(item.price)} each</p>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold">${formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                  <div class="flex justify-between items-center mt-2">
                    <div class="join">
                      <button 
                        class="join-item btn btn-xs btn-outline"
                        onclick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >-</button>
                      <button class="join-item btn btn-xs btn-ghost pointer-events-none" aria-label="Current quantity">
                        {item.quantity}
                      </button>
                      <button 
                        class="join-item btn btn-xs btn-outline"
                        onclick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >+</button>
                    </div>
                    <button 
                      class="btn btn-xs btn-ghost text-error"
                      onclick={() => removeFromCart(item.productId)}
                      aria-label="Remove item from cart"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
        
        <!-- Cart totals and checkout -->
        <div class="border-t border-base-200 p-4">
          <div class="flex justify-between mb-2">
            <span class="text-base-content/70">Subtotal:</span>
            <span class="font-medium">${formatPrice(total)}</span>
          </div>
          <div class="flex justify-between mb-4">
            <span class="text-base-content/70">Tax (0%):</span>
            <span class="font-medium">$0.00</span>
          </div>
          <div class="flex justify-between text-lg font-semibold mb-6">
            <span>Total:</span>
            <span class="text-primary">${formatPrice(total)}</span>
          </div>
          
          <button 
            class="btn btn-primary w-full {cart.length === 0 ? 'btn-disabled' : ''}"
            onclick={processPayment}
            disabled={cart.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Process Payment
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
