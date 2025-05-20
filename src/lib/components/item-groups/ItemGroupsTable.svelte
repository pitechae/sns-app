<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Define the item group type
  export let itemGroups: Array<{
    id: string;
    name: string;
    code: string;
    created_at: number;
  }> = [];
  
  // Selection support
  export let selectable = false;
  let selectedRows: Set<string> = new Set();
  let selectAll = false;
  
  // Create event dispatcher
  const dispatch = createEventDispatcher<{
    edit: { itemGroup: { id: string; name: string; code: string } };
    delete: { itemGroup: { id: string; name: string } };
    selectionChange: { selectedIds: string[] };
  }>();
  
  // Handle edit button click
  function handleEdit(itemGroup: { id: string; name: string; code: string }) {
    dispatch('edit', { itemGroup });
  }
  
  // Handle delete button click
  function handleDelete(itemGroup: { id: string; name: string }) {
    dispatch('delete', { itemGroup });
  }
  
  // Handle row selection
  function toggleRowSelection(id: string) {
    if (selectedRows.has(id)) {
      selectedRows.delete(id);
    } else {
      selectedRows.add(id);
    }
    
    // Update select all checkbox state
    selectAll = itemGroups.length > 0 && selectedRows.size === itemGroups.length;
    selectedRows = selectedRows; // Trigger reactivity
    
    // Dispatch selection change event
    dispatch('selectionChange', { selectedIds: Array.from(selectedRows) });
  }
  
  // Handle select all checkbox
  function toggleSelectAll() {
    selectAll = !selectAll;
    
    if (selectAll) {
      // Select all rows
      selectedRows = new Set(itemGroups.map(group => group.id));
    } else {
      // Deselect all rows
      selectedRows = new Set();
    }
    
    // Dispatch selection change event
    dispatch('selectionChange', { selectedIds: Array.from(selectedRows) });
  }
  
  // Format timestamp to readable date
  function formatDate(timestamp: number | null): string {
    if (!timestamp) return 'N/A';
    
    try {
      // SQLite timestamps are in seconds, JavaScript needs milliseconds
      const date = new Date(timestamp * 1000);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  }
</script>

<div class="overflow-x-auto">
  <table class="table w-full">
    <thead>
      <tr class="bg-base-200/30 border-b border-base-200">
        {#if selectable}
          <th class="w-10">
            <label class="cursor-pointer">
              <input 
                type="checkbox" 
                class="checkbox checkbox-sm checkbox-primary" 
                checked={selectAll} 
                on:change={toggleSelectAll}
                aria-label="Select all item groups"
              />
            </label>
          </th>
        {/if}
        <th class="text-base-content/70 font-medium">Name</th>
        <th class="text-base-content/70 font-medium">Code</th>
        <th class="text-base-content/70 font-medium">Created At</th>
        <th class="text-right text-base-content/70 font-medium">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#if itemGroups.length === 0}
        <tr>
          <td colspan={selectable ? 5 : 4} class="text-center py-8 text-base-content/60">
            <div class="flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mb-2 text-base-content/40">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </svg>
              <p>No item groups found</p>
            </div>
          </td>
        </tr>
      {:else}
        {#each itemGroups as itemGroup (itemGroup.id)}
          <tr class="border-b border-base-200 hover:bg-base-200/30 transition-colors duration-150 {selectedRows.has(itemGroup.id) ? 'bg-primary/5 hover:bg-primary/10' : ''}">
            {#if selectable}
              <td>
                <label class="cursor-pointer">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-sm checkbox-primary" 
                    checked={selectedRows.has(itemGroup.id)} 
                    on:change={() => toggleRowSelection(itemGroup.id)}
                    aria-label="Select {itemGroup.name}"
                  />
                </label>
              </td>
            {/if}
            <td class="font-medium">{itemGroup.name}</td>
            <td><span class="px-2 py-1 bg-base-200/50 rounded text-xs font-mono">{itemGroup.code}</span></td>
            <td>
              <div class="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-base-content/40" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-sm text-base-content/70">{formatDate(itemGroup.created_at)}</span>
              </div>
            </td>
            <td class="text-right">
              <div class="flex justify-end gap-1">
                <button 
                  class="btn btn-sm btn-ghost btn-square text-base-content/70 hover:text-primary hover:bg-primary/10 transition-colors" 
                  on:click={() => handleEdit(itemGroup)}
                  aria-label="Edit {itemGroup.name}"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button 
                  class="btn btn-sm btn-ghost btn-square hover:bg-error/10 hover:text-error text-base-content/70 transition-colors" 
                  on:click={() => handleDelete(itemGroup)}
                  aria-label="Delete {itemGroup.name}"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
