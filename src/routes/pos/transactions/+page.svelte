<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import type { TransactionItem } from '$lib/types/pos';
  
  // Transactions state
  let transactions = $state<Transaction[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let searchQuery = $state('');
  let dateFilter = $state<string>('all');
  let page = $state(1);
  let limit = $state(10);
  let totalPages = $state(1);
  let totalItems = $state(0);
  
  // Transaction details modal
  let selectedTransaction = $state<Transaction | null>(null);
  let isTransactionModalOpen = $state(false);
  let isLoadingDetails = $state(false);
  
  // Types
  type Transaction = {
    id: string;
    date: string;
    total: number;
    items: TransactionItem[];
    itemCount: number;
    paymentMethod: 'CASH' | 'CARD';
    status: 'completed' | 'refunded' | 'failed';
    customerInfo?: {
      name?: string;
      email?: string;
      phone?: string;
    };
  };
  
  // Load transactions from API
  onMount(() => {
    loadTransactions();
  });
  
  // Load transactions from API
  async function loadTransactions(pageNum = 1, search = '', filter = dateFilter) {
    isLoading = true;
    error = null;
    
    try {
      // Calculate date range based on filter
      let dateRange = '';
      
      if (filter !== 'all') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let startDate;
        
        if (filter === 'today') {
          startDate = new Date(today);
        } else if (filter === 'yesterday') {
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 1);
        } else if (filter === 'week') {
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 7);
        }
        
        if (startDate) {
          dateRange = `&startDate=${startDate.toISOString()}`;
        }
      }
      
      // Fetch real transaction data from the API
      const response = await fetch(`/api/pos/transactions?page=${pageNum}&limit=${limit}&search=${encodeURIComponent(search)}${dateRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      
          // Process transaction data without trying to fetch stock data that doesn't exist
      transactions = data.transactions.map((tx: any) => ({
        ...tx,
        itemCount: tx.items.length
      }));
      
      page = data.pagination.page;
      totalPages = data.pagination.totalPages;
      totalItems = data.pagination.totalItems;
    } catch (err) {
      console.error('Error loading transactions:', err);
      error = 'Failed to load transactions. Please try again.';
      transactions = [];
    } finally {
      isLoading = false;
    }
  }
  
  // Get transaction details
  async function getTransactionDetails(id: string) {
    if (!id) return;
    
    isLoadingDetails = true;
    
    try {
      const response = await fetch(`/api/pos/transactions/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transaction details');
      }
      
      const transaction = await response.json();
      
      // Ensure transaction has all required properties
      if (transaction) {
        // Ensure items array exists and has valid properties
        if (transaction.items && Array.isArray(transaction.items)) {
          transaction.items = transaction.items.map((item: any) => ({
            ...item,
            id: item.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            price: typeof item.price === 'number' ? item.price : 0,
            quantity: typeof item.quantity === 'number' ? item.quantity : 1,
            name: item.name || 'Unknown Product'
          }));
        } else {
          transaction.items = [];
        }
        
        // Ensure customerInfo exists
        if (!transaction.customerInfo) {
          transaction.customerInfo = {};
        }
        
        // Ensure total is a number
        if (typeof transaction.total !== 'number') {
          transaction.total = transaction.items.reduce((sum: number, item: any) => 
            sum + (item.price * item.quantity), 0);
        }
      }
      
      selectedTransaction = transaction;
      isTransactionModalOpen = true;
    } catch (err) {
      console.error('Error loading transaction details:', err);
      error = 'Failed to load transaction details. Please try again.';
    } finally {
      isLoadingDetails = false;
    }
  }
  
  // Print receipt
  async function printReceipt(id: string) {
    try {
      const response = await fetch(`/api/pos/printers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionId: id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to print receipt');
      }
      
      // Show success toast or notification
    } catch (err) {
      console.error('Error printing receipt:', err);
      // Show error toast or notification
    }
  }
  
  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
  
  // Handle search
  function handleSearch() {
    loadTransactions(1, searchQuery, dateFilter);
  }
  
  // Handle date filter change
  function handleDateFilterChange() {
    loadTransactions(1, searchQuery, dateFilter);
  }
  
  // Close transaction modal
  function closeTransactionModal() {
    isTransactionModalOpen = false;
    setTimeout(() => {
      selectedTransaction = null;
    }, 300); // Wait for transition to complete
  }
  
  // Get payment method display name
  function getPaymentMethodDisplay(method: string): string {
    switch (method) {
      case 'CASH':
        return 'Cash';
      case 'CARD':
        return 'Card';
      default:
        return method;
    }
  }
  
  // Get status badge class
  function getStatusBadge(status: string | undefined | null): string {
    if (!status) return 'badge-ghost';
    
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'refunded':
        return 'badge-warning';
      case 'failed':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  }
</script>

<svelte:head>
  <title>POS Transactions | SNS App</title>
  <meta name="description" content="View and manage POS transactions" />
</svelte:head>

<div class="w-full max-w-screen-xl mx-auto p-4">
  <!-- Error message -->
  {#if error}
    <div class="alert alert-error mb-6" transition:fade={{ duration: 200 }}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
      <button class="btn btn-sm btn-ghost ml-auto" onclick={() => error = null}>Dismiss</button>
    </div>
  {/if}

  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
    <h1 class="text-2xl font-bold mb-4 md:mb-0">Transaction History</h1>

    <div class="flex flex-col sm:flex-row gap-3">
      <!-- Search input -->
      <div class="form-control">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search transactions..." 
            class="input input-bordered w-full pl-10" 
            bind:value={searchQuery}
            onkeydown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-primary hover:text-primary-focus"
            onclick={handleSearch}
            aria-label="Search transactions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Date filter -->
      <select 
        class="select select-bordered" 
        bind:value={dateFilter}
        onchange={handleDateFilterChange}
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="week">Last 7 Days</option>
      </select>
    </div>
  </div>

  <!-- Transactions table -->
  <div class="bg-base-100 border border-base-200 rounded-lg shadow-sm overflow-hidden">
    {#if isLoading}
      <div class="flex justify-center items-center py-12">
        <div class="loading loading-spinner loading-lg text-primary"></div>
      </div>
    {:else if transactions.length === 0}
      <div class="flex flex-col items-center justify-center py-12 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-base-content/30 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-lg font-medium">No transactions found</h3>
        <p class="text-base-content/60 mt-1">Try changing your search or date filter</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Date & Time</th>
              <th>Amount</th>
              <th>Items</th>
              <th>Payment Method</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each transactions as transaction (transaction.id)}
              <tr class="hover:bg-base-200/50" in:fade={{ duration: 150 }}>
                <td class="font-medium">{transaction?.id || 'Unknown'}</td>
                <td>{transaction?.date ? formatDate(transaction.date) : 'N/A'}</td>
                <td class="font-medium">AED {formatPrice(transaction?.total)}</td>
                <td>{transaction?.itemCount || 0}</td>
                <td>{getPaymentMethodDisplay(transaction?.paymentMethod || 'CASH')}</td>
                <td>
                  <div class="badge {getStatusBadge(transaction?.status || 'pending')} gap-1">
                    {#if transaction?.status === 'completed'}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    {:else if transaction?.status === 'refunded'}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    {:else}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    {/if}
                    {transaction?.status || 'pending'}
                  </div>
                </td>
                <td class="text-right">
                  <div class="flex justify-end gap-2">
                    <button 
                      class="btn btn-sm btn-ghost" 
                      onclick={() => getTransactionDetails(transaction?.id)}
                      aria-label="View transaction details"
                      disabled={!transaction?.id}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button 
                      class="btn btn-sm btn-ghost" 
                      onclick={() => printReceipt(transaction?.id)}
                      aria-label="Print transaction receipt"
                      disabled={!transaction?.id}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      <!-- Pagination controls -->
      {#if totalPages > 1}
        <div class="flex justify-center py-4 border-t border-base-200">
          <div class="join">
            <button 
              class="join-item btn btn-sm {page === 1 ? 'btn-disabled' : 'btn-outline'}"
              onclick={() => loadTransactions(page - 1, searchQuery)}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button class="join-item btn btn-sm btn-ghost pointer-events-none">
              Page {page} of {totalPages}
            </button>
            <button 
              class="join-item btn btn-sm {page === totalPages ? 'btn-disabled' : 'btn-outline'}"
              onclick={() => loadTransactions(page + 1, searchQuery)}
              disabled={page === totalPages}
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
  
  <!-- Transaction Details Modal -->
  {#if isTransactionModalOpen}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" transition:fade={{ duration: 200 }}>
      <div 
        class="bg-base-100 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto" 
        transition:fly={{ y: 20, duration: 200 }}
      >
        <!-- Modal header -->
        <div class="p-4 border-b border-base-200 flex justify-between items-center sticky top-0 bg-base-100 z-10">
          <h3 class="text-lg font-bold">Transaction Details</h3>
          <button 
            class="btn btn-sm btn-ghost" 
            onclick={closeTransactionModal}
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal content -->
        <div class="p-4">
          {#if isLoadingDetails}
            <div class="flex justify-center items-center py-12">
              <div class="loading loading-spinner loading-lg text-primary"></div>
            </div>
          {:else if selectedTransaction}
            <div class="space-y-6">
              <!-- Transaction info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 class="text-sm font-semibold text-base-content/60 mb-1">Transaction ID</h4>
                  <p class="text-base font-medium">{selectedTransaction.id}</p>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-base-content/60 mb-1">Date & Time</h4>
                  <p class="text-base">{formatDate(selectedTransaction.date)}</p>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-base-content/60 mb-1">Payment Method</h4>
                  <p class="text-base">{getPaymentMethodDisplay(selectedTransaction.paymentMethod)}</p>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-base-content/60 mb-1">Status</h4>
                  <div class="badge {getStatusBadge(selectedTransaction.status)} gap-1">
                    {#if selectedTransaction.status === 'completed'}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    {:else if selectedTransaction.status === 'refunded'}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    {:else}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    {/if}
                    {selectedTransaction.status}
                  </div>
                </div>
              </div>
              
              <!-- Customer info if available -->
              {#if selectedTransaction?.customerInfo}
                <div class="border-t border-base-200 pt-4">
                  <h4 class="font-semibold mb-2">Customer Information</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#if selectedTransaction?.customerInfo?.name}
                      <div>
                        <h5 class="text-sm font-semibold text-base-content/60 mb-1">Name</h5>
                        <p class="text-base">{selectedTransaction.customerInfo.name}</p>
                      </div>
                    {/if}
                    {#if selectedTransaction?.customerInfo?.email}
                      <div>
                        <h5 class="text-sm font-semibold text-base-content/60 mb-1">Email</h5>
                        <p class="text-base">{selectedTransaction.customerInfo.email}</p>
                      </div>
                    {/if}
                    {#if selectedTransaction?.customerInfo?.phone}
                      <div>
                        <h5 class="text-sm font-semibold text-base-content/60 mb-1">Phone</h5>
                        <p class="text-base">{selectedTransaction.customerInfo.phone}</p>
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
              
              <!-- Items -->
              <div class="border-t border-base-200 pt-4">
                <h4 class="font-semibold mb-2">Items</h4>
                <div class="overflow-x-auto">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th class="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#if selectedTransaction?.items && selectedTransaction.items.length > 0}
                        {#each selectedTransaction.items as item}
                          <tr>
                            <td>
                              <div>
                                <p>{item?.name || 'Unknown Product'}</p>
                              </div>
                            </td>
                            <td>
                              <div class="flex flex-col">
                                <span>{item?.quantity || 0}</span>
                              </div>
                            </td>
                            <td>AED {formatPrice(item?.price)}</td>
                            <td class="text-right">AED {formatPrice((item?.price || 0) * (item?.quantity || 0))}</td>
                          </tr>
                        {/each}
                      {:else}
                        <tr>
                          <td colspan="4" class="text-center py-4 text-base-content/60">No items in this transaction</td>
                        </tr>
                      {/if}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3" class="text-right font-semibold">Subtotal:</td>
                        <td class="text-right">AED {formatPrice(selectedTransaction?.total)}</td>
                      </tr>
                      <tr>
                        <td colspan="3" class="text-right font-semibold">Tax (0%):</td>
                        <td class="text-right">AED 0.00</td>
                      </tr>
                      <tr>
                        <td colspan="3" class="text-right font-semibold">Total:</td>
                        <td class="text-right font-bold text-primary">AED {formatPrice(selectedTransaction?.total)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="border-t border-base-200 pt-4 flex justify-end gap-3">
                <button 
                  class="btn btn-outline" 
                  onclick={closeTransactionModal}
                >
                  Close
                </button>
                <button 
                  class="btn btn-primary" 
                  onclick={() => selectedTransaction && printReceipt(selectedTransaction.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Receipt
                </button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
