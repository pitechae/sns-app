<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  
  /**
   * Define the props for the component with TypeScript typing using SvelteKit runes
   */
  const { items, showActions = true, isCompact = false, isLoading = false } = $props<{
    items: Array<{
      id: string;
      itemCode: string;
      name: string;
      groupName?: string;
      groupCode?: string;
      createdAt: number;
    }>;
    showActions?: boolean;
    isCompact?: boolean;
    isLoading?: boolean;
  }>();
  
  // Event dispatcher for item actions
  const dispatch = createEventDispatcher<{
    view: { itemId: string };
    edit: { itemId: string };
    delete: { itemId: string };
  }>();
  
  /**
   * Format date function with proper error handling
   */
  function formatDate(timestamp: number | null): string {
    if (!timestamp) return 'N/A';
    
    try {
      // SQLite timestamps are in seconds, JavaScript needs milliseconds
      const date = new Date(timestamp * 1000);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Format the date
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }
  
  /**
   * Handle item view action
   */
  function handleViewItem(itemId: string) {
    dispatch('view', { itemId });
  }
</script>

<div class="w-full rounded-lg border border-base-200 bg-base-100 shadow-sm" transition:fade={{ duration: 200 }}>
  {#if isLoading}
    <div class="flex flex-col items-center justify-center p-8 min-h-[200px]">
      <div class="loading loading-spinner loading-lg text-primary mb-4"></div>
      <p class="text-base-content/70 text-center">Loading items...</p>
    </div>
  {:else if items.length === 0}
    <div class="flex flex-col items-center justify-center p-8 min-h-[200px] text-center">
      <div class="bg-info/10 p-3 rounded-full mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-info" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      </div>
      <h3 class="font-medium text-lg mb-1">No items found</h3>
      <p class="text-base-content/70 max-w-md">Add your first item using the button above to get started.</p>
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="table w-full {isCompact ? 'table-sm' : ''}">
        <thead>
          <tr>
            <th class="bg-base-200/50 font-medium text-base-content/70 border-b border-base-200">Item Code</th>
            <th class="bg-base-200/50 font-medium text-base-content/70 border-b border-base-200">Name</th>
            <th class="bg-base-200/50 font-medium text-base-content/70 border-b border-base-200">Item Group</th>
            <th class="bg-base-200/50 font-medium text-base-content/70 border-b border-base-200">Created At</th>
            {#if showActions}
              <th class="bg-base-200/50 font-medium text-base-content/70 border-b border-base-200 text-right">Actions</th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each items as item, index (item.id)}
            <tr class="hover:bg-base-100/80 border-b border-base-200 transition-colors duration-150" 
                transition:fly|local={{ y: 5, duration: 150, delay: 50 * index }}
            >
              <td class="font-mono text-sm py-3">{item.itemCode}</td>
              <td class="py-3">
                <div class="font-medium">{item.name || 'Unnamed Item'}</div>
              </td>
              <td class="py-3">
                {#if item.groupName}
                  <div class="flex flex-col">
                    <span class="font-medium text-primary">{item.groupName}</span>
                    <span class="text-xs text-base-content/60 font-mono">{item.groupCode}</span>
                  </div>
                {:else}
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-base-200 text-base-content/70">No group</span>
                {/if}
              </td>
              <td class="py-3">
                <div class="flex flex-col">
                  <span class="text-sm">{formatDate(item.createdAt).split(',')[0]}</span>
                  <span class="text-xs text-base-content/60">{formatDate(item.createdAt).split(',')[1]}</span>
                </div>
              </td>
            {#if showActions}
              <td class="py-3 text-right">
                <div class="flex items-center justify-end gap-2">
                  <a 
                    href={`/stock/items/${item.id}`} 
                    class="btn btn-sm btn-ghost text-primary hover:bg-primary/10 transition-colors" 
                    onclick={(e) => { e.preventDefault(); handleViewItem(item.id); }}
                    aria-label="View item details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="hidden sm:inline ml-1">View</span>
                  </a>
                </div>
              </td>
            {/if}
          </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    {#if items.length > 0}
      <div class="py-3 px-4 text-xs text-base-content/60 border-t border-base-200 bg-base-100">
        Showing {items.length} {items.length === 1 ? 'item' : 'items'}
      </div>
    {/if}
  {/if}
</div>
