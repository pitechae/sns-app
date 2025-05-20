<script lang="ts">
  // Define the props for the component
  export let items: Array<{
    id: string;
    itemCode: string;
    name: string;
    groupName?: string;
    groupCode?: string;
    createdAt: number;
  }>;

  // Format date function
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
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }
</script>

<div class="overflow-x-auto">
  {#if items.length === 0}
    <div class="alert alert-info">
      <div>
        <span>No items found. Add your first item using the button above.</span>
      </div>
    </div>
  {:else}
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>Item Code</th>
          <th>Name</th>
          <th>Item Group</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each items as item}
          <tr class="hover">
            <td>{item.itemCode}</td>
            <td>{item.name}</td>
            <td>
              {#if item.groupName}
                <div class="flex flex-col">
                  <span class="font-medium">{item.groupName}</span>
                  <span class="text-xs opacity-70">{item.groupCode}</span>
                </div>
              {:else}
                <span class="opacity-50">No group assigned</span>
              {/if}
            </td>
            <td>{formatDate(item.createdAt)}</td>
            <td>
              <div class="flex space-x-2">
                <a href={`/stock/items/${item.id}`} class="btn btn-sm btn-ghost">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View
                </a>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</div>
