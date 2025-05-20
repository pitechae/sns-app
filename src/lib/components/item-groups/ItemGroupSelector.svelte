<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { clickOutside } from '$lib/actions/clickOutside';
  import { debounce } from '$lib/utils/debounce';
  
  // Types
  export let selectedItemGroup: any = null;
  export let placeholder = 'Search for item group...';
  export let disabled = false;
  export let required = false;
  export let loading = false;
  export let error: string | null = null;
  export let searchEndpoint = '/api/item-groups/search';
  
  // Internal state
  let searchTerm = '';
  let itemGroups: any[] = [];
  let filteredItemGroups: any[] = [];
  let isOpen = false;
  let inputElement: HTMLInputElement;
  let highlightedIndex = -1;
  let isFetching = false;
  let totalItems = 0;
  let hasMore = false;
  let page = 1;
  const limit = 20;
  
  const dispatch = createEventDispatcher<{
    select: { itemGroup: any };
    clear: void;
    search: { term: string };
    error: { message: string };
  }>();
  
  // Debounced search function
  const debouncedSearch = debounce(async (term: string) => {
    if (!term || term.length < 2) {
      filteredItemGroups = [];
      isOpen = false;
      return;
    }
    
    await fetchItemGroups(term);
  }, 200);
  
  // Fetch item groups based on search term
  async function fetchItemGroups(term: string, reset = true) {
    if (reset) {
      page = 1;
      itemGroups = [];
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
        throw new Error('Failed to fetch item groups');
      }
      
      const data = await response.json();
      
      if (reset) {
        itemGroups = data.itemGroups || [];
      } else {
        itemGroups = [...itemGroups, ...(data.itemGroups || [])];
      }
      
      filteredItemGroups = itemGroups;
      totalItems = data.pagination?.total || 0;
      hasMore = itemGroups.length < totalItems;
      
      if (filteredItemGroups.length > 0) {
        highlightedIndex = 0;
      }
      
      dispatch('search', { term });
    } catch (err) {
      console.error('Error fetching item groups:', err);
      const message = err instanceof Error ? err.message : 'An error occurred while searching';
      dispatch('error', { message });
      error = message;
    } finally {
      isFetching = false;
    }
  }
  
  // Load more item groups when scrolling
  function loadMore() {
    if (hasMore && !isFetching) {
      page += 1;
      fetchItemGroups(searchTerm, false);
    }
  }
  
  // Handle input changes
  function handleInput() {
    error = null;
    debouncedSearch(searchTerm);
  }
  
  // Select an item group
  function selectItemGroup(itemGroup: any) {
    selectedItemGroup = itemGroup;
    searchTerm = itemGroup ? `${itemGroup.name} (${itemGroup.code})` : '';
    isOpen = false;
    dispatch('select', { itemGroup });
  }
  
  // Clear selection
  function clearSelection() {
    selectedItemGroup = null;
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
        } else if (highlightedIndex < filteredItemGroups.length - 1) {
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
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredItemGroups.length) {
          selectItemGroup(filteredItemGroups[highlightedIndex]);
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
  
  // Format item group for display
  function formatItemGroup(itemGroup: any) {
    return `${itemGroup.name} (${itemGroup.code})`;
  }
  
  // Initialize component
  onMount(() => {
    if (selectedItemGroup) {
      searchTerm = formatItemGroup(selectedItemGroup);
    }
  });
</script>

<div class="item-group-selector relative w-full" use:clickOutside on:clickoutside={handleClickOutside}>
  <div class="input-wrapper relative">
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
      aria-expanded={isOpen}
      aria-autocomplete="list"
      aria-controls="item-group-dropdown"
      role="combobox"
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
      {#if isFetching}
        <span class="loading loading-spinner loading-xs"></span>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform {isOpen ? 'rotate-180' : ''}" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      {/if}
    </button>
  </div>
  
  {#if error}
    <div class="text-error text-sm mt-1">{error}</div>
  {/if}
  
  {#if isOpen && filteredItemGroups.length > 0}
    <div
      id="item-group-dropdown"
      class="dropdown-menu absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-md bg-base-100 shadow-lg"
      transition:fly={{ y: -5, duration: 150 }}
      role="listbox"
    >
      {#each filteredItemGroups as itemGroup, index}
        <button
          type="button"
          class="w-full px-4 py-2 text-left hover:bg-base-200 focus:bg-base-200 focus:outline-none {index === highlightedIndex ? 'bg-base-200' : ''}"
          on:click={() => selectItemGroup(itemGroup)}
          data-index={index}
          role="option"
          aria-selected={index === highlightedIndex}
        >
          <div class="font-medium">{itemGroup.name}</div>
          <div class="text-sm text-base-content/70">{itemGroup.code}</div>
        </button>
      {/each}
      
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
      <div class="p-4 text-center text-base-content/70">No item groups found</div>
    </div>
  {/if}
</div>

<style>
  .dropdown-menu {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--bc) / 0.2) transparent;
  }
  
  .dropdown-menu::-webkit-scrollbar {
    width: 6px;
  }
  
  .dropdown-menu::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .dropdown-menu::-webkit-scrollbar-thumb {
    background-color: hsl(var(--bc) / 0.2);
    border-radius: 3px;
  }
</style>
