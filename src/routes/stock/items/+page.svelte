<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ItemsTable from '$lib/components/items/ItemsTable.svelte';
  import AddItemModal from '$lib/components/items/AddItemModal.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';
  import type { PageData } from './$types';
  
  /**
   * Get data from server load function using SvelteKit runes
   */
  const { data } = $props<{ data: PageData }>();
  
  /**
   * Define types for items and item groups
   */
  type Item = {
    id: string;
    itemCode: string;
    name: string;
    groupName?: string;
    groupCode?: string;
    createdAt: number;
  };
  
  type ItemGroup = {
    id: string;
    name: string;
    code: string;
  };
  
  /**
   * Local state with reactive declarations
   */
  let items = $state<Item[]>(Array.isArray(data.items) ? data.items : []);
  let itemGroups = $state<ItemGroup[]>(Array.isArray(data.itemGroups) 
    ? data.itemGroups.map((group: any) => ({
        id: group.id,
        name: group.name,
        code: group.code
      })) 
    : []);
  let isAddModalOpen = $state(false);
  let isLoading = $state(false);
  let searchQuery = $state('');
  let viewMode = $state<'table' | 'grid'>('table');
  let searchInputRef = $state<HTMLInputElement | null>(null);
  
  // Pagination state
  let pagination = $state({
    page: Number($page.url.searchParams.get('page')) || 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  /**
   * Refresh items list from the API
   */
  async function refreshItems() {
    isLoading = true;
    
    try {
      // Get current URL parameters
      const url = new URL(window.location.href);
      const page = url.searchParams.get('page') || '1';
      const search = searchQuery ? encodeURIComponent(searchQuery) : '';
      
      // Fetch items with pagination
      const response = await fetch(`/api/stock/items?page=${page}&search=${search}`);
      const responseData = await response.json();
      
      if (response.ok) {
        if (responseData.items && Array.isArray(responseData.items)) {
          // Transform the data to match the ItemsTable component's expected format
          items = responseData.items.map((item: any) => ({
            id: item.id,
            itemCode: item.item_code,
            name: item.name || 'Unnamed Item',
            groupName: item.groupName,
            groupCode: item.groupCode,
            createdAt: item.created_at
          }));
          
          // Update pagination data if available
          if (responseData.pagination) {
            pagination = responseData.pagination;
          } else {
            // Fallback pagination if not provided by API
            pagination = {
              page: Number(page),
              limit: 10,
              total: items.length,
              totalPages: Math.ceil(items.length / 10)
            };
          }
        } else if (Array.isArray(responseData)) {
          // Handle case where API returns an array directly
          items = responseData.map((item: any) => ({
            id: item.id,
            itemCode: item.item_code,
            name: item.name || 'Unnamed Item',
            groupName: item.groupName,
            groupCode: item.groupCode,
            createdAt: item.created_at
          }));
          
          // Fallback pagination
          pagination = {
            page: Number(page),
            limit: 10,
            total: items.length,
            totalPages: Math.ceil(items.length / 10)
          };
        } else {
          console.error('Unexpected API response format:', responseData);
          items = [];
          pagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
        }
      }
    } catch (error) {
      console.error('Failed to refresh items:', error);
      items = [];
    } finally {
      isLoading = false;
    }
  }
  
  /**
   * Handle item added event
   */
  function handleItemAdded() {
    refreshItems();
  }
  
  /**
   * Handle item view event
   */
  function handleViewItem(event: CustomEvent<{ itemId: string }>) {
    const { itemId } = event.detail;
    window.location.href = `/stock/items/${itemId}`;
  }
  
  /**
   * Filter items based on search query (client-side filtering for immediate feedback)
   * Note: For production, filtering should be done server-side with the API
   */
  const filteredItems = $derived(searchQuery.trim() 
    ? items.filter(item => 
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.groupName && item.groupName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : items);
    
  /**
   * Handle search input with debounce
   */
  let searchTimeout: NodeJS.Timeout;
  function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      updateUrl({ page: 1, search: searchQuery }); // Reset to page 1 when searching
    }, 300);
  }
  
  /**
   * Update URL with new query parameters
   */
  function updateUrl({ page, search }: { page?: number; search?: string }) {
    const url = new URL(window.location.href);
    
    if (page !== undefined) {
      url.searchParams.set('page', page.toString());
    }
    
    if (search !== undefined) {
      if (search) {
        url.searchParams.set('search', search);
      } else {
        url.searchParams.delete('search');
      }
    }
    
    goto(url.toString(), { replaceState: true });
  }
  
  /**
   * Handle page change
   */
  function handlePageChange({ detail }: CustomEvent<{ page: number }>) {
    updateUrl({ page: detail.page });
  }
  
  /**
   * Initialize component
   */
  onMount(() => {
    // Refresh items on mount if needed
    if (items.length === 0) {
      refreshItems();
    }
    
    // Set initial search query from URL
    const urlSearchQuery = $page.url.searchParams.get('search');
    if (urlSearchQuery) {
      searchQuery = urlSearchQuery;
    }
  });
  
  /**
   * Watch for URL changes
   */
  $effect(() => {
    // When the URL changes, update the search input and refresh items if needed
    const urlPage = Number($page.url.searchParams.get('page')) || 1;
    const urlSearch = $page.url.searchParams.get('search') || '';
    
    if (pagination.page !== urlPage || searchQuery !== urlSearch) {
      pagination.page = urlPage;
      searchQuery = urlSearch;
      refreshItems();
    }
  });
</script>

<svelte:head>
  <title>Items Management | SNS App</title>
  <meta name="description" content="Manage inventory items" />
</svelte:head>

<div class="w-full max-w-7xl mx-auto" in:fade={{ duration: 250, delay: 100 }}>
  <!-- Page header with improved styling -->
  <header class="mb-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-medium text-base-content">Items Management</h1>
        <p class="text-base-content/70 mt-1.5">View and manage your inventory items</p>
      </div>
      
      <button 
        class="btn btn-primary shadow-sm hover:shadow transition-all duration-200"
        onclick={() => isAddModalOpen = true}
        aria-label="Add new item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 mr-2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Item
      </button>
    </div>
  </header>
  
  <!-- Search and filters with improved styling -->
  <div class="bg-base-100 border border-base-200 rounded-lg shadow-sm mb-8 overflow-hidden">
    <div class="p-4">
      <div class="flex flex-col md:flex-row gap-5 items-center justify-between">
        <!-- Search input with improved styling -->
        <div class="form-control w-full md:max-w-md">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by code, name or group..." 
              class="input input-bordered w-full pl-10 bg-base-100 border-base-300 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200" 
              bind:value={searchQuery}
              bind:this={searchInputRef}
              aria-label="Search items"
            />
            {#if searchQuery}
              <button 
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/40 hover:text-base-content transition-colors"
                onclick={() => { searchQuery = ''; handleSearchInput(); }}
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/if}
          </div>
        </div>
        
        <!-- View options with improved styling -->
        <div class="flex items-center gap-4">
          <div class="flex items-center">
            <span class="text-sm text-base-content/70 mr-2">View:</span>
            <div class="join border border-base-300 rounded-md overflow-hidden">
              <button 
                class="join-item btn btn-sm ${viewMode === 'table' ? 'bg-base-200 text-base-content' : 'bg-base-100 text-base-content/70 hover:text-base-content'} border-0" 
                onclick={() => viewMode = 'table'}
                aria-pressed={viewMode === 'table'}
                aria-label="Table view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.125-3.75h7.5c.621 0 1.125.504 1.125 1.125m-9.75 0h9.75" />
                </svg>
                <span class="hidden sm:inline ml-1.5">Table</span>
              </button>
              <button 
                class="join-item btn btn-sm ${viewMode === 'grid' ? 'bg-base-200 text-base-content' : 'bg-base-100 text-base-content/70 hover:text-base-content'} border-0" 
                onclick={() => viewMode = 'grid'}
                aria-pressed={viewMode === 'grid'}
                aria-label="Grid view"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span class="hidden sm:inline ml-1.5">Grid</span>
              </button>
            </div>
          </div>
          <button 
            class="btn btn-sm btn-ghost hover:bg-base-200 text-base-content/70 hover:text-base-content transition-colors" 
            onclick={refreshItems}
            aria-label="Refresh items"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            <span class="hidden sm:inline ml-1.5">Refresh</span>
          </button>
        </div>
      </div>
      
      <!-- Search results count -->
      {#if searchQuery}
        <div class="mt-3 text-sm text-base-content/70">
          Found {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} matching "{searchQuery}"
          {#if filteredItems.length === 0 && searchQuery}
            <button class="btn btn-xs btn-ghost ml-2" onclick={() => { searchQuery = ''; handleSearchInput(); }}>Clear search</button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Loading state with improved styling -->
  {#if isLoading}
    <div class="flex flex-col items-center justify-center py-16 min-h-[300px]" in:fade={{ duration: 200 }}>
      <div class="loading loading-spinner loading-lg text-primary mb-6"></div>
      <p class="text-base-content/70 text-lg">Loading inventory items...</p>
    </div>
  <!-- No search results with improved styling -->
  {:else if filteredItems.length === 0 && searchQuery}
    <div class="bg-base-100 border border-base-200 rounded-lg shadow-sm overflow-hidden" in:fade={{ duration: 200 }}>
      <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div class="bg-base-200/50 p-4 rounded-full mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-base-content/40" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <h2 class="text-xl font-medium mb-2">No matching items found</h2>
        <p class="text-base-content/70 max-w-md mb-6">We couldn't find any items matching "{searchQuery}"</p>
        <button 
          class="btn btn-primary btn-sm px-6 shadow-sm hover:shadow transition-all duration-200" 
          onclick={() => searchQuery = ''}
        >
          Clear Search
        </button>
      </div>
    </div>
  <!-- Empty state (no items) with improved styling -->
  {:else if items.length === 0}
    <div class="bg-base-100 border border-base-200 rounded-lg shadow-sm overflow-hidden" in:fade={{ duration: 200 }}>
      <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div class="bg-primary/10 p-4 rounded-full mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-primary" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
          </svg>
        </div>
        <h2 class="text-xl font-medium mb-2">No inventory items yet</h2>
        <p class="text-base-content/70 max-w-md mb-6">Get started by adding your first inventory item to the system</p>
        <button 
          class="btn btn-primary shadow-sm hover:shadow transition-all duration-200" 
          onclick={() => isAddModalOpen = true}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 mr-2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add First Item
        </button>
      </div>
    </div>
  <!-- Items table view with improved styling -->
  {:else if viewMode === 'table'}
    <div in:fade={{ duration: 200 }}>
      <!-- Table view -->
      <div class="bg-base-100 border border-base-200 rounded-lg shadow-sm overflow-hidden">
        <ItemsTable 
          items={filteredItems} 
          isLoading={isLoading}
          showActions={true}
          isCompact={false}
          on:view={handleViewItem}
        />
        
        <!-- Pagination for table view -->
        {#if !isLoading && filteredItems.length > 0 && pagination.totalPages > 1}
          <div class="border-t border-base-200 p-4">
            <Pagination 
              currentPage={pagination.page} 
              totalPages={pagination.totalPages}
              limit={pagination.limit}
              total={pagination.total}
              on:pageChange={handlePageChange}
            />
          </div>
        {/if}
      </div>
    </div>
  <!-- Items grid view with improved styling -->
  {:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" in:fade={{ duration: 200 }}>
      {#each filteredItems as item, index (item.id)}
        <div 
          class="bg-base-100 border border-base-200 rounded-lg shadow-sm hover:shadow transition-all duration-200 h-full flex flex-col"
          in:scale|local={{ start: 0.97, duration: 200, delay: 50 * (index % 4) }}
        >
          <div class="p-5 flex-1 flex flex-col">
            <!-- Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                <span class="font-mono">{item.itemCode}</span>
              </div>
              {#if item.groupName}
                <div class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-base-200 text-base-content/70">
                  {item.groupCode}
                </div>
              {/if}
            </div>
            
            <!-- Content -->
            <h3 class="text-lg font-medium text-base-content mb-2">{item.name || 'Unnamed Item'}</h3>
            
            {#if item.groupName}
              <div class="mb-3">
                <div class="text-xs text-base-content/60 uppercase tracking-wider mb-1">Group</div>
                <div class="text-sm text-primary font-medium">{item.groupName}</div>
              </div>
            {/if}
            
            <div class="mt-auto pt-3">
              <div class="text-xs text-base-content/60 uppercase tracking-wider mb-1">Created</div>
              <div class="text-sm text-base-content/80">
                {new Date(item.createdAt * 1000).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
            
            <!-- Actions -->
            <div class="flex justify-end mt-4 pt-4 border-t border-base-200">
              <button 
                class="btn btn-sm btn-ghost text-primary hover:bg-primary/10 transition-colors" 
                onclick={() => window.location.href = `/stock/items/${item.id}`}
                aria-label={`View details for ${item.name || 'item'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                View Details
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Pagination for grid view -->
    {#if !isLoading && filteredItems.length > 0 && pagination.totalPages > 1}
      <div class="mt-8">
        <Pagination 
          currentPage={pagination.page} 
          totalPages={pagination.totalPages}
          limit={pagination.limit}
          total={pagination.total}
          on:pageChange={handlePageChange}
        />
      </div>
    {/if}
  {/if}
</div>

<!-- Add Item Modal with improved styling -->
<AddItemModal 
  isOpen={isAddModalOpen}
  itemGroups={itemGroups}
  title="Add New Inventory Item"
  on:close={() => isAddModalOpen = false}
  on:itemAdded={handleItemAdded}
/>
