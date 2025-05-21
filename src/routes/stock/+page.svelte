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

<div class="p-4 space-y-6">
  <!-- Top Section: Summary Info (Dashboard KPIs) -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Stock Value Card -->
    <div class="bg-base-100 p-4 border-l-4 border-primary rounded">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-base-content/70 uppercase">TOTAL STOCK VALUE</div>
          <div class="text-2xl font-bold mt-1">{stockValue}</div>
          <div class="text-xs text-success flex items-center mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 mr-1" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
            {stockValueChange}% since yesterday
          </div>
        </div>
        <div class="text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
    
    <!-- Total Stock Items Card -->
    <div class="bg-base-100 p-4 border-l-4 border-secondary rounded">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-sm text-base-content/70 uppercase">TOTAL STOCK ITEMS</div>
          <div class="text-2xl font-bold mt-1">{totalStockItems}</div>
          <div class="text-xs text-success flex items-center mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 mr-1" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
            {stockItemsChange}% since last month
          </div>
        </div>
        <div class="text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Quick Access Section -->
  <div>
    <div class="text-lg font-medium mb-3">Quick Access</div>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <!-- Item Card -->
      <a href="/stock/items" class="flex items-center p-3 bg-base-100 border-b-2 border-success hover:bg-base-200 transition-colors rounded">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-success" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
        <div>
          <div class="text-sm font-medium">Items</div>
          <div class="text-xs text-success">{itemsCount} Available</div>
        </div>
      </a>
      
      <!-- Stock Aging Card -->
      <a href="/reports/stock/aging" class="flex items-center p-3 bg-base-100 border-b-2 border-warning hover:bg-base-200 transition-colors rounded">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-warning" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <div class="text-sm font-medium">Stock Aging</div>
          <div class="text-xs text-warning">{materialRequestCount} Items</div>
        </div>
      </a>
      
      <!-- Stock Entry Card -->
      <a href="/stock/entries" class="flex items-center p-3 bg-base-100 border-b-2 border-info hover:bg-base-200 transition-colors rounded">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-info" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
        <div>
          <div class="text-sm font-medium">Stock Entry</div>
        </div>
      </a>
      
      <!-- Purchase Receipt Card -->
      <a href="/stock/purchase-receipt" class="flex items-center p-3 bg-base-100 border-b-2 border-error hover:bg-base-200 transition-colors rounded">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-error" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        <div>
          <div class="text-sm font-medium">Purchase Receipt</div>
          <div class="text-xs text-error">{purchaseReceiptCount} To Bill</div>
        </div>
      </a>
      
      <!-- Delivery Note Card -->
      <a href="/stock/delivery-note" class="flex items-center p-3 bg-base-100 border-b-2 border-error hover:bg-base-200 transition-colors rounded">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-error" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
        <div>
          <div class="text-sm font-medium">Delivery Note</div>
          <div class="text-xs text-error">{deliveryNoteCount} To Bill</div>
        </div>
      </a>
      
      <!-- Stock Ledger Card -->
      <a href="/reports/stock/ledger" class="flex items-center p-3 bg-base-100 border-b-2 border-primary hover:bg-base-200 transition-colors rounded">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-primary" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>
        <div>
          <div class="text-sm font-medium">Stock Ledger</div>
        </div>
      </a>
      
      <!-- Stock Balance Card -->
      <a href="/reports/stock/balance" class="flex items-center p-3 bg-base-100 border-b-2 border-primary hover:bg-base-200 transition-colors rounded">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-primary" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
        </svg>
        <div>
          <div class="text-sm font-medium">Stock Balance</div>
        </div>
      </a>
      
      <!-- Dashboard Card -->
      <a href="/dashboard" class="flex items-center p-3 bg-base-100 border-b-2 border-secondary hover:bg-base-200 transition-colors rounded">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-secondary" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
        </svg>
        <div>
          <div class="text-sm font-medium">Dashboard</div>
        </div>
      </a>
    </div>
  </div>
  
  <!-- Masters & Reports Section -->
  <div class="mt-6">
    <div class="text-lg font-medium mb-3">Masters & Reports</div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Items Catalogue Section -->
      <div>
        <div class="text-sm font-medium mb-2 text-base-content/70">Items Catalogue</div>
        <a href="/stock/items" class="flex items-center p-3 bg-base-100 border-l-4 border-primary hover:bg-base-200 transition-colors rounded">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-primary" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <div class="text-sm">Items</div>
        </a>
      </div>
      
      <!-- Stock Transactions Section -->
      <div>
        <div class="text-sm font-medium mb-2 text-base-content/70">Stock Transactions</div>
        <a href="/reports/stock/aging" class="flex items-center p-3 bg-base-100 border-l-4 border-warning hover:bg-base-200 transition-colors rounded">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-warning" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-sm">Stock Aging</div>
        </a>
      </div>
      
      <!-- Stock Reports Section -->
      <div>
        <div class="text-sm font-medium mb-2 text-base-content/70">Stock Reports</div>
        <a href="/reports/stock/ledger" class="flex items-center p-3 bg-base-100 border-l-4 border-info hover:bg-base-200 transition-colors rounded">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2 text-info" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
          </svg>
          <div class="text-sm">Stock Ledger</div>
        </a>
      </div>
    </div>
  </div>
</div>
