<script lang="ts">
  let { activeTab = $bindable<string>('dashboard') } = $props();
  
  // Define submenu state
  let inventorySubmenuOpen = $state(false);
  let reportsSubmenuOpen = $state(false);
  let commerceSubmenuOpen = $state(false);
  let settingsSubmenuOpen = $state(false);
  
  // Toggle submenu state functions
  function toggleInventorySubmenu() {
    inventorySubmenuOpen = !inventorySubmenuOpen;
  }
  
  function toggleReportsSubmenu() {
    reportsSubmenuOpen = !reportsSubmenuOpen;
  }
  
  function toggleCommerceSubmenu() {
    commerceSubmenuOpen = !commerceSubmenuOpen;
  }
  
  function toggleSettingsSubmenu() {
    settingsSubmenuOpen = !settingsSubmenuOpen;
  }
  
  // Auto-expand relevant sections based on active tab
  $effect(() => {
    if (activeTab === 'pos' || activeTab.startsWith('stock')) {
      inventorySubmenuOpen = true;
    }
    if (activeTab.startsWith('report')) {
      reportsSubmenuOpen = true;
    }
    if (activeTab === 'ecommerce' || activeTab === 'finance') {
      commerceSubmenuOpen = true;
    }
  });
</script>

<aside class="w-64 h-full bg-base-100 text-base-content flex flex-col border-r border-base-200">
  <!-- Logo and brand -->
  <div class="p-4 border-b border-base-200">
    <a href="/" class="text-primary font-bold text-xl flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span>SNS ERP</span>
    </a>
  </div>
  
  <!-- Main navigation -->
  <div class="overflow-y-auto flex-1 py-2">
    <!-- Dashboard section -->
    <ul class="menu menu-sm px-3 gap-1 mb-2">
      <li>
        <a 
          href="/dashboard" 
          class="flex items-center gap-3 rounded-lg {activeTab === 'dashboard' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
          aria-label="Dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </a>
      </li>
    </ul>
    
    <!-- Inventory section -->
    <div class="px-3 py-2">
      <h2 class="text-xs font-semibold text-base-content/60 uppercase tracking-wider px-3">Inventory</h2>
    </div>
    <ul class="menu menu-sm px-3 gap-1">
      <!-- POS direct link -->
      <li>
        <a 
          href="/pos" 
          class="flex items-center gap-3 rounded-lg {activeTab === 'pos' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
          aria-label="Point of Sale"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Point of Sale
        </a>
      </li>
      
      <!-- Stock Management with submenu -->
      <li>
        <button 
          onclick={toggleInventorySubmenu}
          class="flex items-center justify-between w-full rounded-lg {activeTab.startsWith('stock') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
          aria-expanded={inventorySubmenuOpen}
          aria-controls="inventory-submenu"
        >
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <span>Stock Management</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform {inventorySubmenuOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {#if inventorySubmenuOpen}
          <ul id="inventory-submenu" class="menu menu-sm pl-9 mt-1">
            <li>
              <a 
                href="/stock/items" 
                class="rounded-lg {activeTab === 'stock-items' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
              >
                Items
              </a>
            </li>
            <li>
              <a 
                href="/stock/item-groups" 
                class="rounded-lg {activeTab === 'stock-item-groups' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
              >
                Item Groups
              </a>
            </li>
            <li>
              <a 
                href="/stock/entries" 
                class="rounded-lg {activeTab === 'stock-entries' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
              >
                Stock Entries
              </a>
            </li>
            <li>
              <a 
                href="/stock/transfers" 
                class="rounded-lg {activeTab === 'stock-transfers' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
              >
                Stock Transfers
              </a>
            </li>
          </ul>
        {/if}
      </li>
      
      <!-- Reports with submenu -->
      <li>
        <button 
          onclick={toggleReportsSubmenu}
          class="flex items-center justify-between w-full rounded-lg {activeTab.startsWith('report') ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
          aria-expanded={reportsSubmenuOpen}
          aria-controls="reports-submenu"
        >
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Inventory Reports</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform {reportsSubmenuOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {#if reportsSubmenuOpen}
          <ul id="reports-submenu" class="menu menu-sm pl-9 mt-1">
            <li>
              <a 
                href="/reports/stock/summary" 
                class="rounded-lg {activeTab === 'report-stock-summary' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
              >
                Stock Summary
              </a>
            </li>
            <li>
              <a 
                href="/reports/stock/aging" 
                class="rounded-lg {activeTab === 'report-stock-aging' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
              >
                Stock Aging
              </a>
            </li>
            <li>
              <a 
                href="/reports/stock/balance" 
                class="rounded-lg {activeTab === 'report-stock-balance' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
              >
                Stock Balance
              </a>
            </li>
            <li>
              <a 
                href="/reports/stock/sales" 
                class="rounded-lg {activeTab === 'report-stock-sales' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
              >
                Stock Sales
              </a>
            </li>
            <li>
              <a 
                href="/reports/stock/ledger" 
                class="rounded-lg {activeTab === 'report-stock-ledger' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
              >
                Stock Ledger
              </a>
            </li>
          </ul>
        {/if}
      </li>
    </ul>
    
    <!-- Commerce section -->
    <div class="px-3 py-2">
      <h2 class="text-xs font-semibold text-base-content/60 uppercase tracking-wider px-3">Business</h2>
    </div>
    <ul class="menu menu-sm px-3 gap-1">
      <li>
        <button 
          onclick={toggleCommerceSubmenu}
          class="flex items-center justify-between w-full rounded-lg {activeTab === 'ecommerce' || activeTab === 'finance' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
          aria-expanded={commerceSubmenuOpen}
          aria-controls="commerce-submenu"
        >
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Commerce</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform {commerceSubmenuOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {#if commerceSubmenuOpen}
          <ul id="commerce-submenu" class="menu menu-sm pl-9 mt-1">
            <li>
              <a 
                href="/e-commerce" 
                class="rounded-lg {activeTab === 'ecommerce' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
              >
                E-Commerce
              </a>
            </li>
            <li>
              <a 
                href="/finance" 
                class="rounded-lg {activeTab === 'finance' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
              >
                Finance
              </a>
            </li>
          </ul>
        {/if}
      </li>
    </ul>
  </div>
  
  <!-- User section -->
  <div class="p-4 border-t border-base-200">
    <div class="flex items-center gap-3">
      <div class="avatar placeholder">
        <div class="bg-primary text-primary-content rounded-full w-10">
          <span>SA</span>
        </div>
      </div>
      <div>
        <p class="font-medium">Admin User</p>
        <p class="text-xs text-base-content/70">System Administrator</p>
      </div>
    </div>
  </div>
</aside>
