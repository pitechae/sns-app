<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Define props
  export let currentPage: number;
  export let totalPages: number;
  export let limit: number;
  export let total: number;
  
  // Event dispatcher for communicating with parent
  const dispatch = createEventDispatcher<{
    pageChange: { page: number };
  }>();
  
  // Generate an array of page numbers to display
  $: pageNumbers = generatePageNumbers(currentPage, totalPages);
  
  // Calculate the range of items being displayed
  $: startItem = (currentPage - 1) * limit + 1;
  $: endItem = Math.min(startItem + limit - 1, total);
  
  // Generate page numbers with ellipsis for large page counts
  function generatePageNumbers(current: number, total: number): (number | string)[] {
    if (total <= 7) {
      // If there are 7 or fewer pages, show all pages
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    // Always include first and last page
    const pages: (number | string)[] = [];
    
    // Always include first page
    pages.push(1);
    
    // Add ellipsis if needed
    if (current > 3) {
      pages.push('...');
    }
    
    // Add pages around current page
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if needed
    if (current < total - 2) {
      pages.push('...');
    }
    
    // Always include last page
    if (total > 1) {
      pages.push(total);
    }
    
    return pages;
  }
  
  // Handle page change
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      dispatch('pageChange', { page });
    }
  }
</script>

<div class="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
  <!-- Pagination info -->
  <div class="text-sm text-gray-500">
    Showing {startItem} to {endItem} of {total} entries
  </div>
  
  <!-- Pagination controls -->
  <div class="join">
    <!-- Previous page button -->
    <button 
      class="join-item btn btn-sm" 
      disabled={currentPage === 1}
      on:click={() => goToPage(currentPage - 1)}
      aria-label="Previous page"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
    </button>
    
    <!-- Page numbers -->
    {#each pageNumbers as page}
      {#if typeof page === 'number'}
        <button 
          class="join-item btn btn-sm {currentPage === page ? 'btn-active' : ''}" 
          on:click={() => goToPage(page)}
          aria-label="Go to page {page}"
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      {:else}
        <button class="join-item btn btn-sm btn-disabled">...</button>
      {/if}
    {/each}
    
    <!-- Next page button -->
    <button 
      class="join-item btn btn-sm" 
      disabled={currentPage === totalPages || totalPages === 0}
      on:click={() => goToPage(currentPage + 1)}
      aria-label="Next page"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  </div>
</div>
