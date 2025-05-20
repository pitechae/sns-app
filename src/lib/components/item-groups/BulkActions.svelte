<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Define props
  export let selectedIds: string[] = [];
  export let totalCount: number = 0;
  export let isProcessing: boolean = false;
  
  // Event dispatcher for communicating with parent
  const dispatch = createEventDispatcher<{
    exportCsv: void;
    exportJson: void;
    bulkDelete: { ids: string[] };
  }>();
  
  // Handle export to CSV
  function handleExportCsv() {
    dispatch('exportCsv');
  }
  
  // Handle export to JSON
  function handleExportJson() {
    dispatch('exportJson');
  }
  
  // Handle bulk delete
  function handleBulkDelete() {
    if (selectedIds.length > 0) {
      dispatch('bulkDelete', { ids: selectedIds });
    }
  }
</script>

<div class="flex flex-col sm:flex-row gap-2 items-center">
  <div class="text-sm text-gray-500">
    {#if selectedIds.length > 0}
      <span class="font-medium">{selectedIds.length}</span> of <span class="font-medium">{totalCount}</span> items selected
    {:else}
      <span class="font-medium">{totalCount}</span> total items
    {/if}
  </div>
  
  <div class="flex gap-2">
    <div class="dropdown dropdown-end">
      <button class="btn btn-sm" aria-haspopup="true" aria-expanded="false">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        Export
      </button>
      <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li>
          <button on:click={handleExportCsv} disabled={isProcessing || totalCount === 0}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Export as CSV
          </button>
        </li>
        <li>
          <button on:click={handleExportJson} disabled={isProcessing || totalCount === 0}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18.75V6.375c0-1.5-1.125-2.25-2.25-2.25H5.25c-1.5 0-2.25.75-2.25 2.25v12.375c0 1.5 1.125 2.25 2.25 2.25z" />
            </svg>
            Export as JSON
          </button>
        </li>
      </ul>
    </div>
    
    {#if selectedIds.length > 0}
      <button 
        class="btn btn-sm btn-error" 
        on:click={handleBulkDelete}
        disabled={isProcessing || selectedIds.length === 0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        Delete Selected
      </button>
    {/if}
  </div>
</div>
