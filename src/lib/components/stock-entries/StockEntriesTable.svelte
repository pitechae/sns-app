<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Define the stock entry type
  export let stockEntries: Array<{
    id: string;
    item_id: string;
    quantity: number;
    unit: string;
    rate: number;
    type: string;
    supplier?: string;
    invoice_number?: string;
    entry_date: number;
    created_at: number;
    item_name: string;
    item_code: string;
  }> = [];
  
  // Selection support
  export let selectable = false;
  let selectedRows: Set<string> = new Set();
  let selectAll = false;
  
  // Create event dispatcher
  const dispatch = createEventDispatcher<{
    edit: { stockEntry: typeof stockEntries[0] };
    delete: { stockEntry: { id: string; item_name: string } };
    selectionChange: { selectedIds: string[] };
  }>();
  
  // Handle edit button click
  function handleEdit(stockEntry: typeof stockEntries[0]) {
    dispatch('edit', { stockEntry });
  }
  
  // Handle delete button click
  function handleDelete(stockEntry: typeof stockEntries[0]) {
    dispatch('delete', { stockEntry: { id: stockEntry.id, item_name: stockEntry.item_name } });
  }
  
  // Handle row selection
  function toggleRowSelection(id: string) {
    if (selectedRows.has(id)) {
      selectedRows.delete(id);
    } else {
      selectedRows.add(id);
    }
    
    // Update select all checkbox state
    selectAll = stockEntries.length > 0 && selectedRows.size === stockEntries.length;
    selectedRows = selectedRows; // Trigger reactivity
    
    // Dispatch selection change event
    dispatch('selectionChange', { selectedIds: Array.from(selectedRows) });
  }
  
  // Handle select all checkbox
  function toggleSelectAll() {
    selectAll = !selectAll;
    
    if (selectAll) {
      // Select all rows
      selectedRows = new Set(stockEntries.map(entry => entry.id));
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
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  }
  
  // Format currency
  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      currencyDisplay: 'symbol'
    }).format(amount);
  }
  
  // Calculate total value
  function calculateTotal(quantity: number, rate: number): string {
    return formatCurrency(quantity * rate);
  }
  
  // Get badge color based on entry type
  function getTypeBadgeColor(type: string): string {
    switch (type) {
      case 'purchase':
        return 'primary';
      case 'transfer':
        return 'secondary';
      case 'return':
        return 'accent';
      case 'adjustment':
        return 'warning';
      case 'sale':
        return 'info';
      default:
        return 'neutral';
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
                onchange={toggleSelectAll}
                aria-label="Select all stock entries"
              />
            </label>
          </th>
        {/if}
        <th>Item</th>
        <th>Type</th>
        <th>Quantity</th>
        <th>Rate</th>
        <th>Total</th>
        <th>Supplier</th>
        <th>Invoice #</th>
        <th>Date</th>
        <th class="text-right">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#if stockEntries.length === 0}
        <tr>
          <td colspan={selectable ? 10 : 9} class="text-center py-4">
            No stock entries found.
          </td>
        </tr>
      {:else}
        {#each stockEntries as entry (entry.id)}
          <tr class={selectedRows.has(entry.id) ? 'bg-base-200' : ''}>
            {#if selectable}
              <td>
                <label>
                  <input 
                    type="checkbox" 
                    class="checkbox" 
                    checked={selectedRows.has(entry.id)} 
                    onchange={() => toggleRowSelection(entry.id)}
                    aria-label="Select entry for {entry.item_name}"
                  />
                </label>
              </td>
            {/if}
            <td>
              <div class="font-medium">{entry.item_name}</div>
              <div class="text-sm opacity-70">{entry.item_code}</div>
            </td>
            <td>
              <div class="badge badge-{getTypeBadgeColor(entry.type)}">
                {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
              </div>
            </td>
            <td>{entry.quantity} {entry.unit}</td>
            <td>{formatCurrency(entry.rate)}</td>
            <td>{calculateTotal(entry.quantity, entry.rate)}</td>
            <td>{entry.supplier || '-'}</td>
            <td>{entry.invoice_number || '-'}</td>
            <td>{formatDate(entry.entry_date)}</td>
            <td class="text-right">
              <div class="flex justify-end gap-2">
                <button 
                  class="btn btn-sm btn-ghost" 
                  onclick={() => handleEdit(entry)}
                  aria-label="Edit entry for {entry.item_name}"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                <button 
                  class="btn btn-sm btn-ghost text-error" 
                  onclick={() => handleDelete(entry)}
                  aria-label="Delete entry for {entry.item_name}"
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
