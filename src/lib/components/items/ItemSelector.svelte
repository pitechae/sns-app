<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { clickOutside } from '$lib/actions/clickOutside';
  import VirtualList from '$lib/components/common/VirtualList.svelte';
  import BarcodeScanner from '$lib/components/items/BarcodeScanner.svelte';
  import { debounce } from '$lib/utils/debounce';
  
  // Types
  export let selectedItem: any = null;
  export let placeholder = 'Search for an item...';
  export let disabled = false;
  export let required = false;
  export let loading = false;
  export let error: string | null = null;
  export let searchEndpoint = '/api/items/search';
  export let barcodeEndpoint = '/api/items/barcode';
  
  // Internal state
  let searchTerm = '';
  let items: any[] = [];
  let filteredItems: any[] = [];
  let isOpen = false;
  let inputElement: HTMLInputElement;
  let highlightedIndex = -1;
  let isFetching = false;
  let showScanner = false;
  let totalItems = 0;
  let hasMore = false;
  let page = 1;
  const limit = 50;
  
  const dispatch = createEventDispatcher<{
    select: { item: any };
    clear: void;
    search: { term: string };
    error: { message: string };
  }>();
  
  // Debounced search function
  const debouncedSearch = debounce(async (term: string) => {
    if (!term || term.length < 2) {
      filteredItems = [];
      isOpen = false;
      return;
    }
    
    await fetchItems(term);
  }, 300);
  
  // Fetch items based on search term
  async function fetchItems(term: string, reset = true) {
    if (reset) {
      page = 1;
      items = [];
    }
    
    isFetching = true;
    isOpen = true;
    
    try {
      const params = new URLSearchParams({
        q: term,
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await fetch(`${searchEndpoint}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data = await response.json();
      
      if (reset) {
        items = data.items || [];
      } else {
        items = [...items, ...(data.items || [])];
      }
      
      filteredItems = items;
      totalItems = data.pagination?.total || 0;
      hasMore = items.length < totalItems;
      
      if (filteredItems.length > 0) {
        highlightedIndex = 0;
      }
      
      dispatch('search', { term });
    } catch (err) {
      console.error('Error fetching items:', err);
      const message = err instanceof Error ? err.message : 'An error occurred while searching';
      dispatch('error', { message });
      error = message;
    } finally {
      isFetching = false;
    }
  }
  
  // Load more items when scrolling
  function loadMore() {
    if (hasMore && !isFetching) {
      page += 1;
      fetchItems(searchTerm, false);
    }
  }
  
  // Handle barcode scan
  async function handleBarcodeScan(event: CustomEvent<{ barcode: string }>) {
    const { barcode } = event.detail;
    isFetching = true;
    showScanner = false;
    
    try {
      const response = await fetch(`${barcodeEndpoint}?code=${encodeURIComponent(barcode)}`);
      
      if (!response.ok) {
        throw new Error('Item not found');
      }
      
      const item = await response.json();
      selectItem(item);
    } catch (err) {
      console.error('Error fetching item by barcode:', err);
      const message = err instanceof Error ? err.message : 'Item not found';
      dispatch('error', { message });
      error = message;
    } finally {
      isFetching = false;
    }
  }
  
  // Handle input changes
  function handleInput() {
    error = null;
    debouncedSearch(searchTerm);
  }
  
  // Select an item
  function selectItem(item: any) {
    selectedItem = item;
    searchTerm = item ? `${item.name} (${item.item_code})` : '';
    isOpen = false;
    dispatch('select', { item });
  }
  
  // Clear selection
  function clearSelection() {
    selectedItem = null;
    searchTerm = '';
    dispatch('clear');
  }
  
  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    if (disabled) return;
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          isOpen = true;
          highlightedIndex = 0;
        } else if (highlightedIndex < filteredItems.length - 1) {
          highlightedIndex++;
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (highlightedIndex > 0) {
          highlightedIndex--;
        }
        break;
        
      case 'Enter':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
          selectItem(filteredItems[highlightedIndex]);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        isOpen = false;
        break;
        
      case 'Tab':
        isOpen = false;
        break;
        
      default:
        break;
    }
  }
  
  // Toggle dropdown
  function toggleDropdown() {
    if (!disabled) {
      isOpen = !isOpen;
      if (isOpen) {
        inputElement.focus();
      }
    }
  }
  
  // Close dropdown when clicking outside
  function handleClickOutside() {
    isOpen = false;
  }
  
  // Toggle barcode scanner
  function toggleScanner() {
    showScanner = !showScanner;
  }
  
  // Format item for display
  function formatItem(item: any) {
    return `${item.name} (${item.item_code})`;
  }
  
  // Initialize component
  onMount(() => {
    if (selectedItem) {
      searchTerm = formatItem(selectedItem);
    }
  });
</script>

<div class="item-selector relative w-full" use:clickOutside on:clickoutside={handleClickOutside}>
  <div class="input-wrapper relative">
    <div class="flex">
      <div class="relative flex-grow">
        <input
          bind:this={inputElement}
          bind:value={searchTerm}
          on:input={handleInput}
          on:focus={() => searchTerm && (isOpen = true)}
          on:keydown={handleKeydown}
          type="text"
          class="input input-bordered w-full pr-10 {error ? 'input-error' : ''}"
          {placeholder}
          {disabled}
          {required}
          autocomplete="off"
        />
        
        {#if searchTerm && !isFetching}
          <button
            type="button"
            class="absolute right-10 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
            on:click={clearSelection}
            aria-label="Clear selection"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </button>
        {/if}
        
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
          on:click={toggleDropdown}
          aria-label={isOpen ? 'Close dropdown' : 'Open dropdown'}
          disabled={disabled}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      
      <button
        type="button"
        class="btn btn-square ml-2"
        on:click={toggleScanner}
        aria-label="Scan barcode"
        disabled={disabled}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      </button>
    </div>
    
    {#if error}
      <div class="text-error text-sm mt-1">{error}</div>
    {/if}
  </div>
  
  {#if isOpen && filteredItems.length > 0}
    <div
      class="dropdown-menu absolute z-50 mt-1 w-full max-h-96 overflow-hidden rounded-md bg-base-100 shadow-lg"
      transition:fly={{ y: -5, duration: 150 }}
    >
      <VirtualList
        items={filteredItems}
        height={384}
        itemHeight={48}
        onEndReached={loadMore}
        let:item
        let:index
      >
        <button
          type="button"
          class="w-full px-4 py-2 text-left hover:bg-base-200 focus:bg-base-200 focus:outline-none {index === highlightedIndex ? 'bg-base-200' : ''}"
          on:click={() => selectItem(item)}
        >
          <div class="font-medium">{item.name}</div>
          <div class="text-sm text-base-content/70">{item.item_code}</div>
        </button>
      </VirtualList>
      
      {#if isFetching}
        <div class="p-4 text-center">
          <span class="loading loading-spinner loading-sm"></span>
          <span class="ml-2">Loading...</span>
        </div>
      {/if}
      
      {#if hasMore && !isFetching}
        <div class="p-2 text-center">
          <button class="btn btn-sm btn-ghost" on:click={loadMore}>Load more</button>
        </div>
      {/if}
    </div>
  {:else if isOpen && searchTerm.length > 0 && !isFetching}
    <div
      class="dropdown-menu absolute z-50 mt-1 w-full rounded-md bg-base-100 shadow-lg"
      transition:fly={{ y: -5, duration: 150 }}
    >
      <div class="p-4 text-center text-base-content/70">No items found</div>
    </div>
  {/if}
  
  {#if showScanner}
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-base-300/80">
      <div class="card bg-base-100 shadow-xl w-full max-w-md">
        <div class="card-body">
          <div class="flex justify-between items-center">
            <h3 class="card-title">Scan Barcode</h3>
            <button class="btn btn-sm btn-circle" on:click={toggleScanner}>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          
          <BarcodeScanner on:scan={handleBarcodeScan} />
          
          <div class="mt-4 text-sm text-base-content/70">
            <p>Point your camera at a barcode to scan it automatically, or enter the barcode manually below.</p>
          </div>
          
          <div class="mt-2">
            <div class="form-control">
              <div class="input-group">
                <input
                  type="text"
                  placeholder="Enter barcode manually..."
                  class="input input-bordered w-full"
                  on:keydown={(e) => e.key === 'Enter' && handleBarcodeScan(new CustomEvent('scan', { detail: { barcode: e.currentTarget.value } }))}
                />
                <button
                  class="btn btn-square"
                  on:click={(e) => handleBarcodeScan(new CustomEvent('scan', { detail: { barcode: e.currentTarget.previousElementSibling?.value || '' } }))}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
