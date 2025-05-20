<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  // Transactions state
  let transactions = $state<Transaction[]>([]);
  let isLoading = $state(true);
  let searchQuery = $state('');
  let dateFilter = $state<string>('all');
  
  // Types
  type Transaction = {
    id: string;
    date: string;
    amount: number;
    items: number;
    paymentMethod: string;
    status: 'completed' | 'refunded' | 'failed';
  };
  
  // Load transactions (mock data for now)
  onMount(() => {
    // Simulate API call
    setTimeout(() => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      transactions = [
        { 
          id: 'TX-001', 
          date: today.toISOString(), 
          amount: 12.99, 
          items: 3, 
          paymentMethod: 'Credit Card',
          status: 'completed'
        },
        { 
          id: 'TX-002', 
          date: today.toISOString(), 
          amount: 8.50, 
          items: 2, 
          paymentMethod: 'Cash',
          status: 'completed'
        },
        { 
          id: 'TX-003', 
          date: yesterday.toISOString(), 
          amount: 24.75, 
          items: 5, 
          paymentMethod: 'Credit Card',
          status: 'completed'
        },
        { 
          id: 'TX-004', 
          date: yesterday.toISOString(), 
          amount: 15.99, 
          items: 1, 
          paymentMethod: 'Debit Card',
          status: 'refunded'
        },
        { 
          id: 'TX-005', 
          date: lastWeek.toISOString(), 
          amount: 32.50, 
          items: 4, 
          paymentMethod: 'Credit Card',
          status: 'completed'
        },
        { 
          id: 'TX-006', 
          date: lastWeek.toISOString(), 
          amount: 9.99, 
          items: 2, 
          paymentMethod: 'Cash',
          status: 'completed'
        },
        { 
          id: 'TX-007', 
          date: lastWeek.toISOString(), 
          amount: 18.25, 
          items: 3, 
          paymentMethod: 'Debit Card',
          status: 'failed'
        },
      ];
      
      isLoading = false;
    }, 800);
  });
  
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
  
  // Format price
  function formatPrice(price: number): string {
    return price.toFixed(2);
  }
  
  // Computed filtered transactions
  let filteredTransactions = $derived(getFilteredTransactions());
  
  // Function to filter transactions based on search and date
  function getFilteredTransactions(): Transaction[] {
    let filtered = [...transactions];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(query) || 
        tx.paymentMethod.toLowerCase().includes(query)
      );
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      filtered = filtered.filter(tx => {
        const txDate = new Date(tx.date);
        
        if (dateFilter === 'today') {
          return txDate >= today;
        } else if (dateFilter === 'yesterday') {
          return txDate >= yesterday && txDate < today;
        } else if (dateFilter === 'week') {
          return txDate >= lastWeek;
        }
        
        return true;
      });
    }
    
    return filtered;
  }
  
  // Get status badge class
  function getStatusBadge(status: string): string {
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
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
    <h1 class="text-2xl font-bold mb-4 md:mb-0">Transaction History</h1>
    
    <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
            placeholder="Search transactions..." 
            class="input input-bordered w-full pl-10" 
            bind:value={searchQuery}
          />
        </div>
      </div>
      
      <!-- Date filter -->
      <select class="select select-bordered" bind:value={dateFilter}>
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
    {:else if filteredTransactions.length === 0}
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
            {#each filteredTransactions as transaction (transaction.id)}
              <tr class="hover:bg-base-200/50" in:fade={{ duration: 150 }}>
                <td class="font-medium">{transaction.id}</td>
                <td>{formatDate(transaction.date)}</td>
                <td class="font-medium">${formatPrice(transaction.amount)}</td>
                <td>{transaction.items}</td>
                <td>{transaction.paymentMethod}</td>
                <td>
                  <div class="badge {getStatusBadge(transaction.status)} gap-1">
                    {#if transaction.status === 'completed'}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    {:else if transaction.status === 'refunded'}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    {:else}
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    {/if}
                    {transaction.status}
                  </div>
                </td>
                <td class="text-right">
                  <div class="flex justify-end gap-2">
                    <button class="btn btn-sm btn-ghost" aria-label="View transaction details">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button class="btn btn-sm btn-ghost" aria-label="Print transaction receipt">
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
    {/if}
  </div>
</div>
