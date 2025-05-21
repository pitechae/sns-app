<script lang="ts">
  import { onMount } from 'svelte';
  
  // Metrics data with UAE standard formatting
  let stockValue = $state('AED 14.01 M');
  let stockValueChange = $state('11');
  let totalStockItems = $state('63');
  let stockItemsChange = $state('62');
  
  // Quick access counts
  let itemsCount = $state('63');
  let materialRequestCount = $state('12');
  let purchaseReceiptCount = $state('19');
  let deliveryNoteCount = $state('20');
  
  onMount(() => {
    // In a real implementation, these would be fetched from an API
    // This is just for demonstration purposes
  });
</script>

<div class="space-y-8 p-4">
  <!-- Top Section: Summary Info (Dashboard KPIs) -->
  <section class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Stock Value Card -->
    <div class="bg-base-100 rounded-lg shadow-sm p-5 border border-base-200">
      <div class="flex items-start">
        <div class="flex-1">
          <h3 class="text-sm font-medium text-base-content/60 uppercase">TOTAL STOCK VALUE</h3>
          <div class="mt-2">
            <h2 class="text-3xl font-bold">{stockValue}</h2>
            <p class="flex items-center text-sm mt-1 text-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
              {stockValueChange} % since yesterday
            </p>
          </div>
        </div>
        <div class="p-2 bg-primary/10 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-primary" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
    
    <!-- Total Stock Items Card -->
    <div class="bg-base-100 rounded-lg shadow-sm p-5 border border-base-200">
      <div class="flex items-start">
        <div class="flex-1">
          <h3 class="text-sm font-medium text-base-content/60 uppercase">TOTAL STOCK ITEMS</h3>
          <div class="mt-2">
            <h2 class="text-3xl font-bold">{totalStockItems}</h2>
            <p class="flex items-center text-sm mt-1 text-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
              {stockItemsChange} % since last month
            </p>
          </div>
        </div>
        <div class="p-2 bg-primary/10 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-primary" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Quick Access Section -->
  <section>
    <h2 class="text-xl font-bold mb-4">Quick Access</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Item Card -->
      <a href="/stock/items" class="flex justify-between items-center bg-base-100 rounded-lg shadow-sm p-4 border border-base-200 hover:border-primary transition-colors">
        <div class="flex items-center">
          <span class="text-base font-medium">Item</span>
          <span class="ml-2 px-2 py-0.5 text-xs bg-success/20 text-success rounded-full">{itemsCount} Available</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-base-content/60" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </a>
      
      <!-- Material Request Card -->
      <a href="/stock/material-request" class="flex justify-between items-center bg-base-100 rounded-lg shadow-sm p-4 border border-base-200 hover:border-primary transition-colors">
        <div class="flex items-center">
          <span class="text-base font-medium">Material Request</span>
          <span class="ml-2 px-2 py-0.5 text-xs bg-warning/20 text-warning rounded-full">{materialRequestCount} Pending</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-base-content/60" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </a>
      
      <!-- Stock Entry Card -->
      <a href="/stock/entries" class="flex justify-between items-center bg-base-100 rounded-lg shadow-sm p-4 border border-base-200 hover:border-primary transition-colors">
        <div class="flex items-center">
          <span class="text-base font-medium">Stock Entry</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-base-content/60" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </a>
      
      <!-- Purchase Receipt Card -->
      <a href="/stock/purchase-receipt" class="flex justify-between items-center bg-base-100 rounded-lg shadow-sm p-4 border border-base-200 hover:border-primary transition-colors">
        <div class="flex items-center">
          <span class="text-base font-medium">Purchase Receipt</span>
          <span class="ml-2 px-2 py-0.5 text-xs bg-error/20 text-error rounded-full">{purchaseReceiptCount} To Bill</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-base-content/60" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </a>
      
      <!-- Delivery Note Card -->
      <a href="/stock/delivery-note" class="flex justify-between items-center bg-base-100 rounded-lg shadow-sm p-4 border border-base-200 hover:border-primary transition-colors">
        <div class="flex items-center">
          <span class="text-base font-medium">Delivery Note</span>
          <span class="ml-2 px-2 py-0.5 text-xs bg-error/20 text-error rounded-full">{deliveryNoteCount} To Bill</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-base-content/60" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </a>
      
      <!-- Stock Ledger Card -->
      <a href="/reports/stock/ledger" class="flex justify-between items-center bg-base-100 rounded-lg shadow-sm p-4 border border-base-200 hover:border-primary transition-colors">
        <div class="flex items-center">
          <span class="text-base font-medium">Stock Ledger</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-base-content/60" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </a>
      
      <!-- Stock Balance Card -->
      <a href="/reports/stock/balance" class="flex justify-between items-center bg-base-100 rounded-lg shadow-sm p-4 border border-base-200 hover:border-primary transition-colors">
        <div class="flex items-center">
          <span class="text-base font-medium">Stock Balance</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-base-content/60" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </a>
      
      <!-- Dashboard Card -->
      <a href="/dashboard" class="flex justify-between items-center bg-base-100 rounded-lg shadow-sm p-4 border border-base-200 hover:border-primary transition-colors">
        <div class="flex items-center">
          <span class="text-base font-medium">Dashboard</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-base-content/60" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </a>
    </div>
  </section>
  
  <!-- Masters & Reports Section -->
  <section class="space-y-4">
    <h2 class="text-xl font-bold">Masters & Reports</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Items Catalogue Section -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">Items Catalogue</h3>
        <a href="/stock/items" class="flex justify-between items-center bg-base-100 rounded-lg shadow-sm p-3 border border-base-200 hover:border-primary transition-colors">
          <span class="text-base">Item</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-base-content/60" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </a>
      </div>
      
      <!-- Stock Transactions Section -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">Stock Transactions</h3>
        <a href="/reports/stock/aging" class="flex justify-between items-center bg-base-100 rounded-lg shadow-sm p-3 border border-base-200 hover:border-primary transition-colors">
          <span class="text-base">Stock Aging</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-base-content/60" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </a>
      </div>
      
      <!-- Stock Reports Section -->
      <div class="space-y-3">
        <h3 class="text-lg font-semibold">Stock Reports</h3>
        <a href="/reports/stock/ledger" class="flex justify-between items-center bg-base-100 rounded-lg shadow-sm p-3 border border-base-200 hover:border-primary transition-colors">
          <span class="text-base">Stock Ledger</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-base-content/60" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </a>
      </div>
    </div>
  </section>
</div>
