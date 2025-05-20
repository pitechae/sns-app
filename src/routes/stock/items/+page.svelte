<script lang="ts">
  import { onMount } from 'svelte';
  import ItemsTable from '$lib/components/items/ItemsTable.svelte';
  import AddItemModal from '$lib/components/items/AddItemModal.svelte';
  import type { PageData } from './$types';
  
  // Get data from server load function
  export let data: PageData;
  
  // Define types for items
  type Item = {
    id: string;
    itemCode: string;
    name: string;
    groupName?: string;
    groupCode?: string;
    createdAt: number;
  };
  
  type ItemGroup = {
    id: string;
    name: string;
    code: string;
  };
  
  // Local state
  let items: Item[] = Array.isArray(data.items) ? data.items : [];
  let itemGroups: ItemGroup[] = Array.isArray(data.itemGroups) 
    ? data.itemGroups.map((group: any) => ({
        id: group.id,
        name: group.name,
        code: group.code
      })) 
    : [];
  let isAddModalOpen = false;
  let isLoading = false;
  
  // Function to refresh items list
  async function refreshItems() {
    isLoading = true;
    try {
      const response = await fetch('/api/stock/items');
      const responseData = await response.json();
      
      if (response.ok) {
        if (responseData.items && Array.isArray(responseData.items)) {
          // Transform the data to match the ItemsTable component's expected format
          items = responseData.items.map((item: any) => ({
            id: item.id,
            itemCode: item.item_code,
            name: item.name,
            groupName: item.groupName,
            groupCode: item.groupCode,
            createdAt: item.created_at
          }));
        } else if (Array.isArray(responseData)) {
          // Handle case where API returns an array directly
          items = responseData.map((item: any) => ({
            id: item.id,
            itemCode: item.item_code,
            name: item.name,
            groupName: item.groupName,
            groupCode: item.groupCode,
            createdAt: item.created_at
          }));
        } else {
          console.error('Unexpected API response format:', responseData);
          items = [];
        }
      }
    } catch (error) {
      console.error('Failed to refresh items:', error);
      items = [];
    } finally {
      isLoading = false;
    }
  }
  
  // Handle item added event
  function handleItemAdded() {
    refreshItems();
  }
</script>

<svelte:head>
  <title>Items Management</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Items Management</h1>
    
    <button 
      class="btn btn-primary"
      on:click={() => isAddModalOpen = true}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      Add Item
    </button>
  </div>
  
  {#if isLoading}
    <div class="flex justify-center my-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <ItemsTable {items} />
      </div>
    </div>
  {/if}
</div>

<!-- Add Item Modal -->
<AddItemModal 
  isOpen={isAddModalOpen}
  {itemGroups}
  on:close={() => isAddModalOpen = false}
  on:itemAdded={handleItemAdded}
/>
