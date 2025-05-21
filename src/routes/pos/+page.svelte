<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { getStockWebSocket } from '$lib/services/websocket';
  import type { Product, CartItem, Transaction, PaymentMethod, PrinterSettings as PrinterSettingsType, PaymentResult } from '$lib/types/pos';
  import AEDIcon from '$lib/components/icons/AEDIcon.svelte';
  import PaymentModal from '$lib/components/pos/PaymentModal.svelte';
  import PrinterSettings from '$lib/components/pos/PrinterSettings.svelte';
  import StockLedgerModal from '$lib/components/stock/StockLedgerModal.svelte';
  import Receipt from '$lib/components/pos/Receipt.svelte';
  import BarcodeScanner from '$lib/components/pos/BarcodeScanner.svelte';
  
  // POS state
  let cart = $state<CartItem[]>([]);
  let products = $state<Product[]>([]);
  let isLoading = $state(true);
  let isLoadingProducts = $state(true);
  let searchQuery = $state('');
  let error = $state<string | null>(null);
  let lastTransaction = $state<Transaction | null>(null);
  let isPaymentModalOpen = $state(false);
  let isSettingsOpen = $state(false);
  let isStockLedgerOpen = $state(false);
  let selectedProduct = $state<Product | null>(null);
  let isBarcodeEnabled = $state(true);
  let activeCategory = $state<string | null>(null);
  let categories = $state<string[]>([]);
  let currentPage = $state(1); // Renamed from 'page' to avoid conflict with imported 'page'
  let totalPages = $state(1);
  
  // Printer settings
  let printerSettings = $state<PrinterSettingsType>({
    enabled: true,
    printerName: '',
    autoPrint: true,
    useServerPrinting: false
  });
  
  // Business info for receipts
  const businessInfo = {
    name: 'Smart & Style UAQ Branch',
    address: 'Mall Of Green Belt, Umm Al Quwain',
    phone: '+971 50 973 9042',
    email: ''
  };
  
  // Derived values
  let total = $derived(calculateTotal(cart));
  let filteredProducts = $derived(filterProducts(products, searchQuery, activeCategory));
  
  // Filter products based on search query and category
  function filterProducts(products: Product[], query: string, category: string | null): Product[] {
    return products.filter(product => {
      // Filter by category if one is selected
      const matchesCategory = category === null || product.category === category;
      if (!matchesCategory) {
        return false;
      }
      
      // Filter by search query if one is provided
      if (query) {
        const searchLower = query.toLowerCase();
        return (
          product.name.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower) ||
          product.barcode?.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });
  }
  
  // WebSocket connection for real-time stock updates
  
  // WebSocket connection for real-time stock updates
  let stockWebSocket: any = null;
  
  // WebSocket connection for real-time stock updates
  
  onMount(async () => {
    await loadProducts();
    
    // Initialize WebSocket connection in browser environment
    if (typeof window !== 'undefined') {
      try {
        stockWebSocket = getStockWebSocket();
        
        // Register for stock update events
        stockWebSocket.on('stock_update', (data: any) => {
          console.log('Received stock update:', data);
          
          // Update product stock levels if they're in our current products list
          if (data && data.items && Array.isArray(data.items)) {
            let updatedProducts = false;
            
            data.items.forEach((item: any) => {
              const index = products.findIndex(p => p.sku === item.sku || p.id === item.id);
              if (index !== -1) {
                // Update the product stock level
                const newStockLevel = item.quantity || item.inStock || 0;
                const oldStockLevel = products[index].inStock;
                
                // Only update if the stock level has changed
                if (newStockLevel !== oldStockLevel) {
                  products[index].inStock = newStockLevel;
                  updatedProducts = true;
                  
                  // Show notification for low stock items
                  if (newStockLevel <= 5 && newStockLevel > 0) {
                    error = `Low stock alert: ${products[index].name} has only ${newStockLevel} units left`;
                    setTimeout(() => { if (error && error.includes('Low stock alert')) error = null; }, 5000);
                  } else if (newStockLevel === 0) {
                    error = `Out of stock alert: ${products[index].name} is now out of stock`;
                    setTimeout(() => { if (error && error.includes('Out of stock alert')) error = null; }, 5000);
                  }
                  
                  // Also update any matching items in the cart
                  cart = cart.map(cartItem => {
                    if (cartItem.productId === products[index].id || cartItem.sku === item.sku) {
                      return { ...cartItem, currentStock: newStockLevel };
                    }
                    return cartItem;
                  });
                  
                  // Check if any cart items now exceed available stock
                  cart.forEach(cartItem => {
                    if ((cartItem.productId === products[index].id || cartItem.sku === item.sku) && 
                        cartItem.quantity > newStockLevel) {
                      error = `Warning: ${products[index].name} quantity in cart (${cartItem.quantity}) exceeds available stock (${newStockLevel})`;
                      setTimeout(() => { if (error && error.includes('Warning:')) error = null; }, 7000);
                    }
                  });
                }
              }
            });
            
            // If products were updated, refresh the filtered products
            if (updatedProducts) {
              // This will trigger a reactive update of filteredProducts
              products = [...products];
            }
          }
        });
        
        // Send initial sync request to get latest stock levels
        stockWebSocket.emit('sync_request', { type: 'stock_levels' });
        
      } catch (error) {
        console.error('Failed to initialize WebSocket connection:', error);
      }
    }
  });
  
  onDestroy(() => {
    // Clean up WebSocket connection when component is destroyed
    if (stockWebSocket) {
      stockWebSocket.disconnect();
    }
  });
  
  // Load products from API
  async function loadProducts(pageNum = 1, search = '') {
    isLoadingProducts = true;
    error = null; // Clear any previous errors
    
    try {
      // Use the stock inventory API to get real inventory items
      const response = await fetch(`/api/stock/entries?page=${pageNum}&limit=20&search=${encodeURIComponent(search)}`, {
        // Add cache control headers to prevent caching
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Log the received data structure to help diagnose issues
      console.log('API Response structure:', Object.keys(data));
      
      if (!data.entries || !Array.isArray(data.entries)) {
        console.error('Invalid data format:', data);
        throw new Error('Invalid data format received from API');
      }
      
      // Log the number of entries received
      console.log(`Received ${data.entries.length} entries from API`);
      
      // Map stock entries to POS products format with real data
      products = data.entries.map((entry: any) => {
        // Extract SKU from item code (e.g., BPS30, BTS140)
        const sku = entry.itemCode || '';
        const category = sku.substring(0, 3) === 'BPS' ? "BOY'S POLO SHIRT" : 
                       sku.substring(0, 3) === 'BTS' ? "BOY'S SHORT PANT" : 'General';
        
        return {
          id: entry.id || `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: entry.itemName || entry.item_name || entry.name || entry.description || sku || 'Product',
          price: typeof entry.rate === 'number' ? entry.rate : (typeof entry.price === 'number' ? entry.price : 23.00),
          category: category,
          barcode: sku,
          sku: sku,
          image: entry.image || undefined,
          inStock: typeof entry.quantity === 'number' ? entry.quantity : (typeof entry.stock === 'number' ? entry.stock : 0)
        };
      });
      
      currentPage = data.pagination?.page || 1;
      totalPages = data.pagination?.totalPages || 1;
      
      // Extract unique categories
      const categorySet = new Set(products.map(p => p.category));
      categories = Array.from(categorySet);
      
      console.log(`Successfully loaded ${products.length} products from inventory API`);
    } catch (err: any) {
      console.error('Error loading products:', err);
      const errorMessage = err?.message || 'Unknown error';
      error = `Unable to connect to inventory system: ${errorMessage}. Using demo data.`;
      setTimeout(() => { error = null; }, 5000);
      
      // Fallback to demo data based on real stock entries
      products = [
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
          id: 'bps30-2',
          name: "BOY'S POLO SHIRT",
          price: 23.00,
          category: "BOY'S POLO SHIRT",
          barcode: 'BPS30',
          sku: 'BPS30',
          image: undefined,
          inStock: 20
        },
        {
          id: 'bps30-3',
          name: "BOY'S POLO SHIRT",
          price: 23.00,
          category: "BOY'S POLO SHIRT",
          barcode: 'BPS30',
          sku: 'BPS30',
          image: undefined,
          inStock: 120
        }
      ];
      
      // Extract unique categories from mock data
      const categorySet = new Set(products.map(p => p.category));
      categories = Array.from(categorySet);
      page = 1;
      totalPages = 1;
    } finally {
      isLoadingProducts = false;
      isLoading = false;
    }
  }
  
  // This filtering logic is now handled by the filterProducts function above
  // and the derived filteredProducts variable
  
  // Add item to cart
  function addToCart(product: Product) {
    // Check if product is in stock
    if (product.inStock <= 0) {
      error = `${product.name} is out of stock`;
      setTimeout(() => { error = null; }, 3000);
      return;
    }
    
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Check if requested quantity exceeds available stock
      if (existingItem.quantity + 1 > product.inStock) {
        error = `Cannot add more ${product.name}. Only ${product.inStock} available in stock.`;
        setTimeout(() => { error = null; }, 3000);
        return;
      }
      
      // Update quantity if item already in cart
      cart = cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, currentStock: product.inStock } 
          : item
      );
    } else {
      // Add new item to cart
      cart = [...cart, {
        productId: product.id,
        name: product.name,
        price: product.price,
        sku: product.sku,
        quantity: 1,
        currentStock: product.inStock
      }];
    }
  }
  
  // Add item by barcode
  async function addItemByBarcode(barcode: string) {
    if (!barcode) return;
    
    // First check if it's in our loaded products
    const product = products.find(p => 
      p.barcode?.toLowerCase() === barcode.toLowerCase() || 
      p.sku?.toLowerCase() === barcode.toLowerCase()
    );
    
    if (product) {
      addToCart(product);
      searchQuery = '';
      return;
    }
    
    // If not found locally, try to fetch from API
    try {
      console.log(`Looking up barcode: ${barcode}`);
      const response = await fetch(`/api/pos/lookup/barcode/${encodeURIComponent(barcode)}`, {
        // Add cache control headers to prevent caching
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          error = `Product with barcode ${barcode} not found`;
          throw new Error(`Product with barcode ${barcode} not found`);
        }
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
      }
      
      const product = await response.json();
      console.log('Found product:', product);
      addToCart(product);
      searchQuery = '';
    } catch (err) {
      console.error('Error adding item by barcode:', err);
      error = `Product not found: ${barcode}`;
    }
  }
  
  // Handle barcode scan
  function handleBarcodeScan(event: CustomEvent<{barcode: string}>) {
    const { barcode } = event.detail;
    addItemByBarcode(barcode);
  }
  
  // Update item quantity
  function updateQuantity(productId: string, newQuantity: number) {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      cart = cart.filter(item => item.productId !== productId);
      return;
    }
    
    // Find the item in the cart
    const cartItem = cart.find(item => item.productId === productId);
    if (!cartItem) return;
    
    // Find the corresponding product to check current stock
    const product = products.find(p => p.id === productId);
    
    // If we can't find the product or if requested quantity exceeds available stock
    if (!product || newQuantity > product.inStock) {
      const maxAvailable = product?.inStock || cartItem.currentStock || 0;
      error = `Cannot update quantity. Only ${maxAvailable} units available in stock.`;
      setTimeout(() => { error = null; }, 3000);
      return;
    }
    
    // Update quantity
    cart = cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity, currentStock: product.inStock } 
        : item
    );
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
  
  // Format price - safely handle undefined, null, or NaN values
  function formatPrice(price: number | undefined | null): string {
    if (price === undefined || price === null || isNaN(price)) return '0.00';
    try {
      return price.toFixed(2);
    } catch (err) {
      console.error('Error formatting price:', price, err);
      return '0.00';
    }
  }
  
  // Format price with AED currency symbol - this function is used in the template
  // to display prices with the AED currency symbol
  function formatPriceWithCurrency(price: number | undefined | null): string {
    return formatPrice(price);
  }
  
  // Open payment modal
  function openPaymentModal() {
    if (cart.length === 0) return;
    isPaymentModalOpen = true;
  }
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Handle payment completion
  async function handlePaymentComplete(event: CustomEvent<PaymentResult>) {
    const result = event.detail;
    
    if (result.success && result.transactionId) {
      try {
        // Create transaction items with all necessary details for inventory updates
        const transactionItems = cart.map(item => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          transactionId: result.transactionId!,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          sku: item.sku || ''
        }));
        
        // Create a transaction object
        const transaction: Transaction = {
          id: result.transactionId,
          date: new Date().toISOString(),
          timestamp: Date.now(),
          total: total,
          paymentMethod: result.paymentMethod || 'CASH',
          status: 'completed',
          items: transactionItems
        };
        
        // Send the transaction to the server to update inventory
        try {
          const response = await fetch('/api/pos/transactions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              total: transaction.total,
              paymentMethod: transaction.paymentMethod,
              items: transaction.items
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to create transaction');
          }
          
          // Update local product stock levels to reflect the changes
          cart.forEach(item => {
            const productIndex = products.findIndex(p => p.id === item.productId);
            if (productIndex !== -1) {
              products[productIndex].inStock -= item.quantity;
            }
          });
          
          console.log('Transaction created successfully:', transaction.id);
        } catch (apiError) {
          console.error('API error, falling back to local transaction:', apiError);
          // Even if the API fails, we'll still create a local transaction for receipt purposes
        }
        
        // Store last transaction for receipt
        lastTransaction = transaction;
        
        // Print receipt if enabled and auto-print is on
        if (printerSettings?.enabled && printerSettings?.autoPrint) {
          printReceipt(lastTransaction);
        }
        
        // Clear cart and reset state
        cart = [];
        isPaymentModalOpen = false;
        
        // Show success message
        setTimeout(() => {
          alert('Payment successful! Transaction ID: ' + (lastTransaction?.id || 'Unknown'));
        }, 500);
      } catch (err) {
        console.error('Error creating transaction:', err);
        error = 'Failed to complete transaction. Please try again.';
        isPaymentModalOpen = false;
      }
    }
  }
  
  // Close payment modal regardless of success/failure
  function closePaymentModal() {
    isPaymentModalOpen = false;
  }
  
  // Close stock ledger modal
  function closeStockLedgerModal() {
    isStockLedgerOpen = false;
    selectedProduct = null;
  }
  
  // Print receipt using browser-native printing or server-side printing
  async function printReceipt(transaction: Transaction) {
    if (!transaction) return;
    
    // First try the server-side printing if enabled and configured
    if (printerSettings.enabled && printerSettings.printerName && printerSettings.useServerPrinting) {
      try {
        const response = await fetch('/api/pos/printers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            transactionId: transaction.id,
            printerName: printerSettings.printerName,
            businessName: businessInfo.name,
            businessAddress: businessInfo.address,
            businessPhone: businessInfo.phone,
            businessEmail: businessInfo.email
          })
        });
        
        if (response.ok) {
          console.log('Server-side printing successful');
          return; // Exit if server printing was successful
        } else {
          console.warn('Server-side printing failed, falling back to browser printing');
        }
      } catch (err) {
        console.error('Server-side printing error:', err);
      }
    }
    
    // Browser-native printing as fallback or primary method
    try {
      // Create a hidden iframe for printing
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);
      
      // Create receipt content optimized for 58mm thermal printer (32-35 chars per line)
      const receiptContent = `
        <html>
        <head>
          <title>Receipt ${transaction.id}</title>
          <style>
            @page {
              size: 58mm auto; /* Width of thermal paper roll */
              margin: 0mm;
            }
            body {
              font-family: monospace;
              font-size: 9pt;
              line-height: 1.1;
              margin: 0;
              padding: 1mm;
              width: 56mm; /* 58mm - 2mm for padding */
              box-sizing: border-box;
            }
            .center { text-align: center; }
            .header { font-weight: bold; font-size: 10pt; }
            .divider { border-top: 1px dashed #000; margin: 1mm 0; }
            .item { display: flex; justify-content: space-between; }
            .item-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .item-qty { width: 5mm; text-align: center; }
            .item-price { width: 15mm; text-align: right; }
            .total { font-weight: bold; margin-top: 1mm; }
            .footer { margin-top: 2mm; font-size: 8pt; }
            /* Hide print button when printing */
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="center header">${businessInfo.name}</div>
          <div class="center">${businessInfo.address}</div>
          <div class="center">${businessInfo.phone}</div>
          <div class="divider"></div>
          <div>Receipt: ${transaction.id}</div>
          <div>Date: ${new Date(transaction.date).toLocaleDateString()}</div>
          <div>Time: ${new Date(transaction.date).toLocaleTimeString()}</div>
          <div class="divider"></div>
          
          ${transaction.items.map(item => `
            <div class="item">
              <div class="item-name">${item.name}</div>
              <div class="item-qty">${item.quantity}</div>
              <div class="item-price">د.إ ${formatPrice(item.price * item.quantity)}</div>
            </div>
            <div class="item">
              <div class="item-name"></div>
              <div class="item-qty"></div>
              <div class="item-price">@${formatPrice(item.price)}</div>
            </div>
          `).join('')}
          
          <div class="divider"></div>
          <div class="item total">
            <div>TOTAL</div>
            <div>د.إ ${formatPrice(transaction.total)}</div>
          </div>
          <div class="item">
            <div>PAYMENT</div>
            <div>${transaction.paymentMethod}</div>
          </div>
          <div class="divider"></div>
          <div class="center footer">Thank you for your purchase!</div>
          <div class="center footer">Please come again</div>
          
          <button class="no-print" style="margin-top: 10mm; width: 100%; padding: 2mm;" onclick="window.print(); setTimeout(() => window.close(), 500);">Print Receipt</button>
        </body>
        </html>
      `;
      
      // Set the content and print
      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(receiptContent);
        frameDoc.close();
        
        // Wait for content to load before printing
        printFrame.onload = () => {
          try {
            // Print the receipt
            printFrame.contentWindow?.print();
            
            // Remove the iframe after printing (or after a timeout)
            setTimeout(() => {
              document.body.removeChild(printFrame);
            }, 1000);
          } catch (err) {
            console.error('Printing failed:', err);
            error = 'Failed to print receipt. Please try again.';
            setTimeout(() => { error = null; }, 3000);
          }
        };
      }
    } catch (err) {
      console.error('Error setting up browser printing:', err);
      error = 'Failed to prepare receipt for printing.';
      setTimeout(() => { error = null; }, 3000);
    }
  }
  
  // Handle search
  function handleSearch() {
    loadProducts(1, searchQuery);
  }
  
  // Toggle settings panel
  function toggleSettings() {
    isSettingsOpen = !isSettingsOpen;
  }
</script>

<svelte:head>
  <title>POS Terminal | SNS App</title>
  <meta name="description" content="Point of Sale Terminal" />
</svelte:head>

{#if isSettingsOpen}
  <div transition:fade={{ duration: 200 }}>
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-base-100 rounded-lg shadow-lg w-full max-w-lg">
        <div class="p-4 border-b border-base-200 flex justify-between items-center">
          <h2 class="text-lg font-medium">Printer Settings</h2>
          <button class="btn btn-sm btn-ghost" onclick={() => isSettingsOpen = false} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-4">
          <PrinterSettings
            bind:settings={printerSettings}
            on:printTest={(e) => printReceipt(e.detail.transaction)}
          />
        </div>
        <div class="p-4 border-t border-base-200 flex justify-end gap-2">
          <button class="btn btn-primary" onclick={() => isSettingsOpen = false}>Save</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Error notification -->
{#if error}
  <div class="fixed top-4 right-4 z-50" transition:fly={{ y: -20, duration: 200 }}>
    <div class="bg-error/10 border-l-4 border-error text-error px-4 py-3 rounded shadow-md flex items-start">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
    </div>
  </div>
{/if}

<BarcodeScanner 
  enabled={isBarcodeEnabled}
  on:scan={handleBarcodeScan}
/>

{#if isPaymentModalOpen}
  <PaymentModal 
    isOpen={isPaymentModalOpen}
    cartItems={cart}
    total={total}
    on:close={closePaymentModal}
    on:paymentComplete={handlePaymentComplete}
  />
{/if}

<StockLedgerModal 
  isOpen={isStockLedgerOpen}
  productId={selectedProduct?.id}
  sku={selectedProduct?.sku}
  productName={selectedProduct?.name}
/>

<!-- Main POS Interface -->
<div class="flex h-screen bg-base-100 mb-4 overflow-hidden">
  <!-- Left sidebar - Barcode scanner and quick functions -->
  <div class="w-80 border-r border-base-200 flex flex-col h-full">
    <div class="p-4 border-b border-base-200 flex items-center justify-between">
      <div class="flex items-center">
        <div class="text-primary mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        </div>
        <div>
          <h1 class="font-medium text-lg">POS Terminal</h1>
          <p class="text-xs text-base-content/70">Ready for transactions</p>
        </div>
      </div>
    </div>
    
    <!-- Barcode scanner section -->
    <div class="p-4 border-b border-base-200">
      <div class="relative">
        <input 
          type="text" 
          class="w-full pr-10 text-base border-b-2 border-primary/30 focus:border-primary bg-transparent py-2 px-1 outline-none transition-colors" 
          placeholder="Scan barcode..." 
          bind:value={searchQuery}
          onkeydown={(e) => e.key === 'Enter' && addItemByBarcode(searchQuery)}
        />
        <button 
          class="absolute inset-y-0 right-0 px-1 flex items-center text-primary"
          onclick={() => addItemByBarcode(searchQuery)}
          aria-label="Add item by barcode"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <div class="flex items-center mt-2 text-xs">
        <div class="w-2 h-2 rounded-full bg-success mr-2"></div>
        <span class="text-base-content/70">Scanner active</span>
      </div>
    </div>
    
    <!-- Quick action buttons -->
    <div class="p-4 border-b border-base-200">
      <div class="text-sm font-medium mb-3 text-base-content/70">Quick Actions</div>
      <div class="grid grid-cols-2 gap-2">
        <button class="flex items-center p-2 border-b-2 border-primary/70 bg-base-100 hover:bg-base-200 transition-colors rounded">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span class="text-sm">Hold Sale</span>
        </button>
        <button class="flex items-center p-2 border-b-2 border-warning/70 bg-base-100 hover:bg-base-200 transition-colors rounded">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
          </svg>
          <span class="text-sm">Discounts</span>
        </button>
        <button class="flex items-center p-2 border-b-2 border-info/70 bg-base-100 hover:bg-base-200 transition-colors rounded">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span class="text-sm">Clipboard</span>
        </button>
        <button class="flex items-center p-2 border-b-2 border-secondary/70 bg-base-100 hover:bg-base-200 transition-colors rounded">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span class="text-sm">Void Sale</span>
        </button>
      </div>
    </div>
    
    <!-- Customer section -->
    <div class="p-4 border-b border-base-300">
      <div class="flex justify-between items-center mb-2">
        <h2 class="font-medium text-sm">Customer</h2>
        <button class="btn btn-xs btn-ghost" aria-label="Add Customer">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span class="sr-only">Add Customer</span>
        </button>
      </div>
      
      <div class="flex items-center p-3 border-l-4 border-secondary bg-base-100 rounded">
        <div class="text-secondary mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium">Guest Customer</p>
          <p class="text-xs text-base-content/70">Walk-in</p>
        </div>
      </div>
    </div>
    
    <!-- Settings and tools -->
    <div class="mt-auto p-4 border-t border-base-200">
      <div class="grid grid-cols-5 gap-2">
        <button class="flex flex-col items-center justify-center p-2 text-primary hover:bg-base-200 rounded transition-colors" onclick={toggleSettings} aria-label="Settings">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-xs mt-1">Settings</span>
        </button>
        <button class="flex flex-col items-center justify-center p-2 text-info hover:bg-base-200 rounded transition-colors" onclick={() => isStockLedgerOpen = true} aria-label="Stock Ledger">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-xs mt-1">Ledger</span>
        </button>
        <button class="flex flex-col items-center justify-center p-2 text-warning hover:bg-base-200 rounded transition-colors" aria-label="Help">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xs mt-1">Help</span>
        </button>
        <button class="flex flex-col items-center justify-center p-2 text-error hover:bg-base-200 rounded transition-colors" aria-label="Notifications">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="text-xs mt-1">Alerts</span>
        </button>
        <button class="flex flex-col items-center justify-center p-2 text-secondary hover:bg-base-200 rounded transition-colors" aria-label="User profile">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span class="text-xs mt-1">Profile</span>
          <span class="sr-only">User profile</span>
        </button>
      </div>
    </div>
  </div>
  
  <!-- Center content - Cart items -->
  <div class="flex-1 flex flex-col h-full overflow-hidden">
    <!-- Header with store info and search -->
    <div class="bg-base-100 border-b border-base-300 p-4 flex justify-between items-center">
      <h2 class="text-xl font-bold">Current Sale</h2>
      <div class="flex items-center gap-2">
        <span class="text-sm text-base-content/70">{new Date().toLocaleDateString()}</span>
        <div class="badge badge-primary">Cashier: Admin</div>
      </div>
    </div>
    
    <!-- Cart items -->
    <div class="flex-1 overflow-y-auto p-4">
      {#if cart.length === 0}
        <div class="flex flex-col items-center justify-center h-full text-base-content/50">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="text-xl font-medium mb-2">Cart is Empty</h3>
          <p class="text-base-content/70 text-center max-w-md">
            Scan a barcode or search for products to add items to the cart.
          </p>
        </div>
      {:else}
        <div class="space-y-2">
          {#each cart as item (item.productId)}
            <div class="bg-base-100 border border-base-300 rounded-lg p-3 flex justify-between items-center" in:fade={{ duration: 150 }}>
              <div class="flex-1">
                <div class="flex justify-between">
                  <div>
                    <h4 class="font-medium">{item.name}</h4>
                    {#if item.sku}
                      <p class="text-xs text-base-content/60">{item.sku}</p>
                    {/if}
                  </div>
                  <div class="text-right">
                    <p class="font-semibold flex items-center justify-end">
                      <AEDIcon width={14} height={12} class="mr-1" /> {formatPrice(item.price * item.quantity)}
                    </p>
                    <p class="text-xs text-base-content/60 flex items-center justify-end">
                      <AEDIcon width={10} height={8} class="mr-1" /> {formatPrice(item.price)} each
                    </p>
                  </div>
                </div>
                <div class="flex justify-between items-center mt-2">
                  <div class="flex items-center gap-2">
                    <button 
                      class="btn btn-xs btn-circle btn-ghost"
                      onclick={() => updateQuantity(item.productId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >−</button>
                    <span class="font-medium">{item.quantity}</span>
                    <button 
                      class="btn btn-xs btn-circle btn-ghost"
                      onclick={() => updateQuantity(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                  <button 
                    class="btn btn-xs btn-ghost text-error"
                    onclick={() => removeFromCart(item.productId)}
                    aria-label="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Right sidebar - Payment and totals -->
  <div class="w-96 bg-base-100 border-l border-base-300 flex flex-col h-full">
    <!-- Order summary -->
    <div class="p-4 border-b border-base-300">
      <h2 class="text-lg font-bold mb-4">Order Summary</h2>
      
      <div class="space-y-3">
        <div class="flex justify-between">
          <span class="text-base-content/70">Subtotal ({cart.length} items)</span>
          <span class="flex items-center">
            <AEDIcon width={14} height={12} class="mr-1" /> {formatPrice(total)}
          </span>
        </div>
        
        <div class="flex justify-between items-center">
          <span class="text-base-content/70">Discount</span>
          <div class="flex items-center gap-2">
            <span class="flex items-center">-<AEDIcon width={14} height={12} class="mx-1" /> 0.00</span>
            <button class="btn btn-xs btn-ghost" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span class="sr-only">Search</span>
            </button>
          </div>
        </div>
        
        <div class="flex justify-between">
          <span class="text-base-content/70">Tax (5% VAT)</span>
          <span class="flex items-center">+<AEDIcon width={14} height={12} class="mx-1" /> {formatPrice(total * 0.05)}</span>
        </div>
        
        <div class="border-t border-base-300 pt-3 mt-2">
          <div class="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span class="text-primary flex items-center">
              <AEDIcon width={16} height={14} class="mr-1" color="currentColor" /> {formatPrice(total + (total * 0.05))}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Payment methods -->
    <div class="p-4 flex-1">
      <h3 class="font-bold mb-4">Payment Method</h3>
      
      <div class="grid grid-cols-2 gap-3 mb-4">
        <button 
          class="btn btn-outline flex flex-col h-auto py-3 hover:bg-primary hover:text-primary-content"
          onclick={() => { isPaymentModalOpen = true; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Cash</span>
        </button>
        
        <button 
          class="btn btn-outline flex flex-col h-auto py-3 hover:bg-primary hover:text-primary-content"
          onclick={() => { isPaymentModalOpen = true; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>Card</span>
        </button>
        
        <button class="btn btn-outline flex flex-col h-auto py-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>App Pay</span>
        </button>
        
        <button class="btn btn-outline flex flex-col h-auto py-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Credit</span>
        </button>
      </div>
      
      <div class="divider">or</div>
      
      <!-- Process payment button -->
      <button 
        class="btn btn-primary w-full btn-lg {cart.length === 0 ? 'btn-disabled' : ''}"
        onclick={openPaymentModal}
        disabled={cart.length === 0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Process Payment
      </button>
    </div>
    
    <!-- Keyboard shortcuts info -->
    <div class="p-4 border-t border-base-300 bg-base-200">
      <div class="flex justify-between text-xs text-base-content/70">
        <span>F1: Help</span>
        <span>F2: Search</span>
        <span>F3: Discount</span>
        <span>F12: Pay</span>
      </div>
    </div>
  </div>
</div>
  
  <!-- Last transaction receipt -->
  {#if lastTransaction}
    <div class="mb-6" transition:fade={{ duration: 200 }}>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Last Transaction</h2>
        <button 
          class="btn btn-sm btn-ghost"
          onclick={() => lastTransaction = null}
          aria-label="Close receipt"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Receipt 
          transaction={lastTransaction} 
          {businessInfo}
          on:print={(e) => printReceipt(e.detail.transaction)}
        />
        
        <div class="bg-base-100 border border-base-200 rounded-lg p-6 flex flex-col justify-center items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-success mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-xl font-medium mb-2">Transaction Complete</h3>
          <p class="text-base-content/70 text-center mb-6">Transaction {lastTransaction?.id || 'unknown'} has been successfully processed.</p>
          <button 
            class="btn btn-primary"
            onclick={() => lastTransaction = null}
          >
            New Transaction
          </button>
        </div>
      </div>
    </div>
  {/if}
  
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <!-- Product selection (2/3 width on large screens) -->
    <div class="lg:col-span-2 space-y-4">
      <!-- Search and categories -->
      <div class="p-4 border-l-4 border-primary bg-base-100 rounded">
        <div class="flex flex-col md:flex-row gap-3">
          <!-- Search input -->
          <div class="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search products..." 
              class="w-full pr-10 text-base border-b-2 border-primary/30 focus:border-primary bg-transparent py-2 px-1 outline-none transition-colors" 
              bind:value={searchQuery}
              onkeydown={(e) => e.key === 'Enter' && loadProducts(1, searchQuery)}
            />
            <div class="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
              {#if searchQuery}
                <button 
                  class="p-1 text-base-content/60 hover:text-error transition-colors rounded-full"
                  onclick={() => { searchQuery = ''; loadProducts(1, ''); }}
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              {/if}
              <button 
                class="p-1 text-primary hover:text-primary/80 transition-colors"
                onclick={() => loadProducts(1, searchQuery)}
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Categories -->
        <div class="flex flex-wrap gap-2 mt-4">
          <button 
            class="px-3 py-1 text-sm rounded {activeCategory === null ? 'bg-secondary text-secondary-content' : 'bg-base-200 hover:bg-base-300 transition-colors'}"
            onclick={() => activeCategory = null}
          >
            All
          </button>
          {#each categories as category}
            <button 
              class="px-3 py-1 text-sm rounded {activeCategory === category ? 'bg-secondary text-secondary-content' : 'bg-base-200 hover:bg-base-300 transition-colors'}"
              onclick={() => activeCategory = category}
            >
              {category}
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Products grid -->
      <div class="p-4 border-l-4 border-secondary bg-base-100 rounded">
        {#if isLoadingProducts}
          <div class="flex justify-center items-center py-8">
            <div class="loading loading-spinner loading-md text-secondary"></div>
          </div>
        {:else if filteredProducts.length === 0}
          <div class="flex flex-col items-center justify-center py-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-base-content/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-base font-medium mb-1">No products found</h3>
            <p class="text-sm text-base-content/70 max-w-md">
              {searchQuery ? `No products matching "${searchQuery}" were found.` : 'No products available in this category.'}
            </p>
            {#if searchQuery}
              <button 
                class="mt-3 px-3 py-1 text-sm border border-base-300 rounded hover:bg-base-200 transition-colors"
                onclick={() => { searchQuery = ''; loadProducts(1, ''); }}
              >
                Clear search
              </button>
            {/if}
          </div>
        {:else}
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {#each filteredProducts as product (product.id)}
              <button 
                class="bg-base-100 border border-base-200 hover:border-secondary/30 hover:bg-secondary/5 rounded-lg p-3 text-center transition-all flex flex-col items-center justify-between h-full"
                onclick={() => addToCart(product)}
                oncontextmenu={(e) => {
                  e.preventDefault();
                  selectedProduct = product;
                  isStockLedgerOpen = true;
                }}
                in:fade={{ duration: 150 }}
                aria-label="Add {product.name} to cart"
              >
                <div class="w-full">
                  {#if product.image}
                    <div class="rounded-lg h-16 w-16 mx-auto flex items-center justify-center mb-2 overflow-hidden">
                      <img src={product.image} alt={product.name} class="object-cover w-full h-full" />
                    </div>
                  {:else}
                    <div class="bg-base-200/50 rounded-lg h-16 w-16 mx-auto flex items-center justify-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                  {/if}
                  <h3 class="font-medium text-base-content truncate">{product.name}</h3>
                  <p class="text-primary font-semibold mt-1 flex items-center justify-center">
                    <AEDIcon width={14} height={12} class="mr-1" /> {formatPrice(product.price)}
                  </p>
                </div>
                <div class="mt-2 w-full">
                  <div class="flex justify-between items-center text-xs mb-1">
                    <span class="text-base-content/60">{product.sku || product.category}</span>
                    <div class="flex items-center">
                      <div class="w-2 h-2 rounded-full mr-1 {product.inStock > 10 ? 'bg-success' : (product.inStock > 0 ? 'bg-warning' : 'bg-error')}"></div>
                      <span class="{product.inStock > 10 ? 'text-success' : (product.inStock > 0 ? 'text-warning' : 'text-error')} font-medium">
                        {product.inStock > 0 ? `${product.inStock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                  <div class="btn btn-sm {product.inStock > 0 ? 'bg-error text-error-content hover:bg-error/90' : 'btn-disabled bg-base-200'} w-full flex items-center justify-center gap-1 border-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    {product.inStock > 0 ? 'Add to Cart' : 'Out of Stock'}                    
                  </div>
                </div>
              </button>
            {/each}
          </div>
          
          <!-- Pagination controls if needed -->
          {#if totalPages > 1}
            <div class="flex justify-center mt-6">
              <div class="join">
                <button 
                  class="join-item btn btn-sm {currentPage === 1 ? 'btn-disabled' : 'btn-outline'}"
                  onclick={() => loadProducts(currentPage - 1, searchQuery)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button class="join-item btn btn-sm btn-ghost pointer-events-none">
                  Page {currentPage} of {totalPages}
                </button>
                <button 
                  class="join-item btn btn-sm {currentPage === totalPages ? 'btn-disabled' : 'btn-outline'}"
                  onclick={() => loadProducts(currentPage + 1, searchQuery)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          {/if}
        {/if}
      </div>
    </div>
    
    <!-- Cart and checkout (1/3 width on large screens) -->
    <div class="lg:col-span-1">
      <div class="border-l-4 border-error bg-base-100 rounded h-full flex flex-col">
        <!-- Cart header -->
        <div class="p-4 border-b border-base-200">
          <div class="flex justify-between items-center">
            <h2 class="text-base font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart
            </h2>
            {#if cart.length > 0}
              <button 
                class="px-2 py-1 text-xs text-error hover:bg-error/10 rounded transition-colors"
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
            <div class="text-center text-base-content/70 py-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-base-content/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-sm font-medium">Your cart is empty</p>
              <p class="text-xs mt-1">Add items to get started</p>
            </div>
          {:else}
            <ul class="space-y-3">
              {#each cart as item (item.productId)}
                <li class="border-b border-base-200 p-3" in:fly={{ y: 10, duration: 200 }}>
                  <div class="flex justify-between">
                    <div>
                      <h4 class="text-sm font-medium">{item.name}</h4>
                      <div class="flex items-center gap-1">
                        <p class="text-xs text-base-content/70">{item.sku || 'No SKU'}</p>
                        {#if item.currentStock !== undefined}
                          <div class="flex items-center">
                            <div class="w-1.5 h-1.5 rounded-full mr-0.5 {item.currentStock > 10 ? 'bg-success' : (item.currentStock > item.quantity ? 'bg-warning' : 'bg-error')}"></div>
                            <span class="text-xs {item.currentStock > 10 ? 'text-success' : (item.currentStock > item.quantity ? 'text-warning' : 'text-error')}">
                              {item.currentStock} left
                            </span>
                          </div>
                        {/if}
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium">AED {formatPrice(item.price * item.quantity)}</p>
                      <p class="text-xs text-base-content/70">AED {formatPrice(item.price)} each</p>
                    </div>
                  </div>
                  <div class="flex justify-between items-center mt-2">
                    <div class="flex items-center border border-base-200 rounded">
                      <button 
                        class="px-2 py-1 text-base-content/70 hover:text-error transition-colors"
                        onclick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 12H4" />
                        </svg>
                      </button>
                      <span class="w-8 text-center text-sm">{item.quantity}</span>
                      <button 
                        class="px-2 py-1 text-base-content/70 hover:text-primary transition-colors"
                        onclick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                    <button 
                      class="p-1 text-base-content/40 hover:text-error transition-colors"
                      onclick={() => removeFromCart(item.productId)}
                      aria-label="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
        
        <!-- Checkout section -->
        <div class="p-4 border-t border-base-200 bg-base-100/50">
          <div class="flex justify-between mb-2">
            <span class="text-sm text-base-content/70">Subtotal:</span>
            <span class="text-sm">AED {formatPrice(total)}</span>
          </div>
          <div class="flex justify-between mb-4">
            <span class="text-sm text-base-content/70">Tax (0%):</span>
            <span class="text-sm">AED 0.00</span>
          </div>
          <div class="flex justify-between font-medium mb-4 pb-2 border-b border-base-200">
            <span>Total:</span>
            <span class="text-error">AED {formatPrice(total)}</span>
          </div>
          
          <button 
            class="w-full py-3 px-4 bg-error text-error-content rounded flex items-center justify-center transition-colors hover:bg-error/90 {cart.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}"
            onclick={openPaymentModal}
            disabled={cart.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Process Payment
          </button>
        </div>
      </div>
    </div>
  </div>
