<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { clickOutside } from '$lib/actions/clickOutside';
  import { debounce } from '$lib/utils/debounce';
  
  // Define item type for better type safety
  type Item = Record<string, any>;
  
  // Types
  export let items: Array<Item> = [];
  export let selectedItem: Item | null = null;
  export let placeholder = 'Search...';
  export let disabled = false;
  export let required = false;
  export let loading = false;
  export let error: string | null = null;
  export let maxItems = 7; // Maximum number of items to show in dropdown
  export let labelKey = 'label';
  export let valueKey = 'value';
  // Using const instead of let for export-only reference
  export const idKey = 'id';
  
  // Internal state
  let searchTerm = '';
  let filteredItems: any[] = [];
  let isOpen = false;
  let inputElement: HTMLInputElement;
  let highlightedIndex = -1;
  let scrollContainer: HTMLDivElement;
  
  const dispatch = createEventDispatcher<{
    select: { item: any };
    clear: void;
    search: { term: string };
  }>();
  
  // Debounced search function
  const debouncedSearch = debounce((term: string) => {
    if (!term) {
      filteredItems = items.slice(0, maxItems);
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    
    // Log search term and available items for debugging
    console.log('Searching for:', lowerTerm);
    console.log('Available items:', items);
    
    // Improved search logic with more flexible matching
    filteredItems = items
      .filter(item => {
        // Check if the search term is in the label
        const labelMatch = String(item[labelKey] || '').toLowerCase().includes(lowerTerm);
        
        // Check if the search term is in the value (item code)
        const valueMatch = String(item[valueKey] || '').toLowerCase().includes(lowerTerm);
        
        // Check for partial matches in the label (for multi-word labels)
        const labelWords = String(item[labelKey]).toLowerCase().split(/\s+/);
        const partialLabelMatch = labelWords.some((word: string) => word.includes(lowerTerm));
        
        return labelMatch || valueMatch || partialLabelMatch;
      })
      .slice(0, maxItems);
    
    if (filteredItems.length > 0) {
      highlightedIndex = 0;
    } else {
      highlightedIndex = -1;
    }
    
    dispatch('search', { term });
  }, 150);
  
  // Handle input changes
  function handleInput() {
    error = null;
    isOpen = true;
    debouncedSearch(searchTerm);
  }
  
  // Select an item
  function selectItem(item: any) {
    selectedItem = item;
    searchTerm = item[labelKey];
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
          scrollToHighlighted();
        }
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        if (highlightedIndex > 0) {
          highlightedIndex--;
          scrollToHighlighted();
        }
        break;
        
      case 'Enter':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
          selectItem(filteredItems[highlightedIndex]);
        } else if (!isOpen) {
          isOpen = true;
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
  
  // Scroll to highlighted item
  function scrollToHighlighted() {
    if (scrollContainer && highlightedIndex >= 0) {
      const element = scrollContainer.querySelector(`[data-index="${highlightedIndex}"]`);
      if (element) {
        element.scrollIntoView({ block: 'nearest' });
      }
    }
  }
  
  // Toggle dropdown
  function toggleDropdown() {
    if (!disabled) {
      isOpen = !isOpen;
      if (isOpen) {
        inputElement.focus();
        debouncedSearch(searchTerm);
      }
    }
  }
  
  // Close dropdown when clicking outside
  function handleClickOutside() {
    isOpen = false;
  }
  
  // Initialize component
  onMount(() => {
    if (selectedItem) {
      searchTerm = selectedItem[labelKey];
    }
    
    // Initial filtered items
    filteredItems = items.slice(0, maxItems);
  });
  
  // Update filtered items when items change
  $: if (items) {
    debouncedSearch(searchTerm);
  }
</script>

<div class="searchable-select relative w-full" use:clickOutside={() => (isOpen = false)}>
  <div class="input-wrapper relative">
    <input
      bind:this={inputElement}
      bind:value={searchTerm}
      on:input={handleInput}
      on:focus={() => isOpen = true}
      on:keydown={handleKeydown}
      type="text"
      class="input input-bordered w-full pr-10 {error ? 'input-error' : ''}"
      {placeholder}
      {disabled}
      {required}
      autocomplete="off"
      aria-expanded={isOpen}
      aria-autocomplete="list"
      aria-controls="searchable-select-dropdown"
      role="combobox"
    />
    
    {#if searchTerm && !loading}
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
      {#if loading}
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
  
  {#if isOpen}
    <div
      id="searchable-select-dropdown"
      class="dropdown-menu absolute z-50 mt-1 w-full max-h-64 overflow-auto rounded-md bg-base-100 shadow-lg"
      transition:fly={{ y: -5, duration: 150 }}
      bind:this={scrollContainer}
      role="listbox"
    >
      {#if filteredItems.length > 0}
        {#each filteredItems as item, index}
          <button
            type="button"
            class="w-full px-4 py-2 text-left hover:bg-base-200 focus:bg-base-200 focus:outline-none {index === highlightedIndex ? 'bg-base-200' : ''}"
            on:click={() => selectItem(item)}
            data-index={index}
            role="option"
            aria-selected={index === highlightedIndex}
          >
            <div class="font-medium">{item[labelKey]}</div>
            {#if item[valueKey] !== item[labelKey]}
              <div class="text-sm text-base-content/70">{item[valueKey]}</div>
            {/if}
          </button>
        {/each}
      {:else if searchTerm}
        <div class="p-4 text-center text-base-content/70">No items found</div>
      {:else}
        <div class="p-4 text-center text-base-content/70">Type to search</div>
      {/if}
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
