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
  <table class="table table-zebra w-full">
    <thead>
      <tr>
        {#if selectable}
          <th class="w-10">
            <label>
              <input 
                type="checkbox" 
                class="checkbox" 
                checked={selectAll} 
                on:change={toggleSelectAll}
                aria-label="Select all item groups"
              />
            </label>
          </th>
        {/if}
        <th>Name</th>
        <th>Code</th>
        <th>Created At</th>
        <th class="text-right">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#if itemGroups.length === 0}
        <tr>
          <td colspan={selectable ? 5 : 4} class="text-center py-4">
            No item groups found.
          </td>
        </tr>
      {:else}
        {#each itemGroups as itemGroup (itemGroup.id)}
          <tr class={selectedRows.has(itemGroup.id) ? 'bg-base-200' : ''}>
            {#if selectable}
              <td>
                <label>
                  <input 
                    type="checkbox" 
                    class="checkbox" 
                    checked={selectedRows.has(itemGroup.id)} 
                    on:change={() => toggleRowSelection(itemGroup.id)}
                    aria-label="Select {itemGroup.name}"
                  />
                </label>
              </td>
            {/if}
            <td>{itemGroup.name}</td>
            <td>{itemGroup.code}</td>
            <td>{formatDate(itemGroup.created_at)}</td>
            <td class="text-right">
              <div class="flex justify-end gap-2">
                <button 
                  class="btn btn-sm btn-ghost" 
                  on:click={() => handleEdit(itemGroup)}
                  aria-label="Edit {itemGroup.name}"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button 
                  class="btn btn-sm btn-ghost text-error" 
                  on:click={() => handleDelete(itemGroup)}
                  aria-label="Delete {itemGroup.name}"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
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
