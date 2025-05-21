<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import type { StockTransaction, StockTransactionType, Pagination } from '$lib/types/stock';
  
  // Component props
  let { 
    productId = $bindable<string | null>(null),
    sku = $bindable<string | null>(null)
  } = $props();
  
  // State variables
  let transactions = $state<StockTransaction[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let pagination = $state<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Filter state
  let fromDate = $state<string | null>(null);
  let toDate = $state<string | null>(null);
  let selectedType = $state<StockTransactionType | null>(null);
  let isFilterOpen = $state(false);
  
  // Load transactions on mount and when filters change
  $effect(() => {
    loadTransactions(pagination.page, productId, sku, fromDate, toDate, selectedType);
  });
  
  // Format transaction quantity with sign
  function formatQuantity(quantity: number): string {
    return quantity > 0 ? `+${quantity}` : `${quantity}`;
  }
  
  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  // Format time
  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Get CSS class for transaction type
  function getTypeClass(type: StockTransactionType): string {
    switch (type) {
      case 'sale':
        return 'text-error';
      case 'purchase':
        return 'text-success';
      case 'return':
        return 'text-warning';
      case 'adjustment':
        return 'text-info';
      default:
        return '';
    }
  }
  
  // Get CSS class for quantity
  function getQuantityClass(quantity: number): string {
    return quantity > 0 ? 'text-success' : 'text-error';
  }
  
  // Load transactions from API
  async function loadTransactions(
    page = 1,
    productId: string | null = null,
    sku: string | null = null,
    fromDate: string | null = null,
    toDate: string | null = null,
    type: StockTransactionType | null = null
  ) {
    isLoading = true;
    error = null;
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (productId) params.append('productId', productId);
      if (sku) params.append('sku', sku);
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (type) params.append('type', type);
      
      // Fetch transactions
      const response = await fetch(`/api/stock/transactions?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      transactions = data.transactions;
      pagination = data.pagination;
    } catch (err) {
      console.error('Error loading transactions:', err);
      error = err instanceof Error ? err.message : 'Failed to load transactions';
      transactions = [];
    } finally {
      isLoading = false;
    }
  }
  
  // Apply filters
  function applyFilters() {
    pagination.page = 1; // Reset to first page when applying filters
    isFilterOpen = false;
  }
  
  // Reset filters
  function resetFilters() {
    fromDate = null;
    toDate = null;
    selectedType = null;
    pagination.page = 1;
  }
  
  // Handle page change
  function changePage(newPage: number) {
    if (newPage < 1 || (pagination.totalPages && newPage > pagination.totalPages)) return;
    pagination.page = newPage;
  }
</script>

<div class="bg-base-100 border border-base-200 rounded-lg shadow-sm">
  <!-- Header with title and filter toggle -->
  <div class="p-4 border-b border-base-200 flex justify-between items-center">
    <h2 class="text-lg font-medium">Stock Ledger</h2>
    
    <div class="flex gap-2">
      <button 
        class="btn btn-sm btn-ghost" 
        onclick={() => isFilterOpen = !isFilterOpen}
        aria-label={isFilterOpen ? 'Hide filters' : 'Show filters'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span class="ml-1">{isFilterOpen ? 'Hide Filters' : 'Filters'}</span>
      </button>
    </div>
  </div>
  
  <!-- Filters -->
  {#if isFilterOpen}
    <div class="p-4 border-b border-base-200 bg-base-200/30" transition:slide={{ duration: 200 }}>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Date range -->
        <div class="form-control">
          <label class="label" for="from-date">
            <span class="label-text">From Date</span>
          </label>
          <input 
            id="from-date"
            type="date" 
            class="input input-sm input-bordered w-full" 
            bind:value={fromDate}
          />
        </div>
        
        <div class="form-control">
          <label class="label" for="to-date">
            <span class="label-text">To Date</span>
          </label>
          <input 
            id="to-date"
            type="date" 
            class="input input-sm input-bordered w-full" 
            bind:value={toDate}
          />
        </div>
        
        <!-- Transaction type -->
        <div class="form-control">
          <label class="label" for="transaction-type">
            <span class="label-text">Transaction Type</span>
          </label>
          <select 
            id="transaction-type"
            class="select select-sm select-bordered w-full" 
            bind:value={selectedType}
          >
            <option value={null}>All Types</option>
            <option value="sale">Sale</option>
            <option value="purchase">Purchase</option>
            <option value="return">Return</option>
            <option value="adjustment">Adjustment</option>
          </select>
        </div>
      </div>
      
      <div class="flex justify-end mt-4 gap-2">
        <button class="btn btn-sm btn-ghost" onclick={resetFilters}>
          Reset
        </button>
        <button class="btn btn-sm btn-primary" onclick={applyFilters}>
          Apply Filters
        </button>
      </div>
    </div>
  {/if}
  
  <!-- Transactions table -->
  <div class="overflow-x-auto">
    {#if isLoading}
      <div class="flex justify-center items-center py-12">
        <div class="loading loading-spinner loading-lg text-primary"></div>
      </div>
    {:else if error}
      <div class="p-4 text-center text-error">
        <p>{error}</p>
        <button class="btn btn-sm btn-ghost mt-2" onclick={() => loadTransactions()}>
          Retry
        </button>
      </div>
    {:else if transactions.length === 0}
      <div class="p-8 text-center text-base-content/70">
        <p>No transactions found.</p>
      </div>
    {:else}
      <table class="table table-zebra">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Product</th>
            <th>SKU</th>
            <th class="text-right">Quantity</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          {#each transactions as transaction (transaction.id)}
            <tr class="hover:bg-base-200/50">
              <td>
                <div class="font-medium">{formatDate(transaction.date)}</div>
                <div class="text-xs text-base-content/70">{formatTime(transaction.date)}</div>
              </td>
              <td>
                <span class={getTypeClass(transaction.type)}>
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </span>
              </td>
              <td>{transaction.productName}</td>
              <td>
                <span class="font-mono text-xs">{transaction.sku}</span>
              </td>
              <td class="text-right">
                <span class={getQuantityClass(transaction.quantity)}>
                  {formatQuantity(transaction.quantity)}
                </span>
              </td>
              <td>
                <span class="font-mono text-xs">{transaction.reference}</span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
  
  <!-- Pagination -->
  {#if !isLoading && !error && transactions.length > 0}
    <div class="p-4 border-t border-base-200 flex justify-between items-center">
      <div class="text-sm text-base-content/70">
        Showing {(pagination.page - 1) * pagination.limit + 1} - 
        {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
      </div>
      
      <div class="join">
        <button 
          class="join-item btn btn-sm" 
          disabled={pagination.page === 1}
          onclick={() => changePage(1)}
          aria-label="First page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <button 
          class="join-item btn btn-sm" 
          disabled={pagination.page === 1}
          onclick={() => changePage(pagination.page - 1)}
          aria-label="Previous page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {#each Array.from({ length: Math.min(5, pagination.totalPages || 1) }, (_, i) => {
          const start = Math.max(1, pagination.page - 2);
          const end = Math.min(pagination.totalPages || 1, start + 4);
          return start + i <= end ? start + i : null;
        }).filter((page): page is number => page !== null) as pageNum}
          <button 
            class="join-item btn btn-sm {pageNum === pagination.page ? 'btn-active' : ''}" 
            onclick={() => changePage(pageNum)}
          >
            {pageNum}
          </button>
        {/each}
        
        <button 
          class="join-item btn btn-sm" 
          disabled={pagination.page === pagination.totalPages}
          onclick={() => changePage(pagination.page + 1)}
          aria-label="Next page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button 
          class="join-item btn btn-sm" 
          disabled={pagination.page === pagination.totalPages}
          onclick={() => pagination.totalPages && changePage(pagination.totalPages)}
          aria-label="Last page"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  {/if}
</div>
