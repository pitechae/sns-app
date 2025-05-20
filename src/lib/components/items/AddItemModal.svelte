<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount } from 'svelte';
  import ItemGroupSelector from '$lib/components/item-groups/ItemGroupSelector.svelte';
  
  // Define props
  export let itemGroups: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  export let isOpen = false;
  
  // Local state
  let itemCode = '';
  let selectedGroupId = '';
  let isSubmitting = false;
  let error = '';
  let selectedGroup: (typeof itemGroups)[0] | null = null;
  
  // Event dispatcher for communicating with parent
  const dispatch = createEventDispatcher<{
    close: void;
    itemAdded: { item: any };
  }>();
  
  // Reset form
  function resetForm() {
    itemCode = '';
    selectedGroupId = '';
    selectedGroup = null;
    error = '';
    isSubmitting = false;
  }
  
  // Close modal
  function closeModal() {
    resetForm();
    dispatch('close');
  }
  
  // Handle item group selection
  function handleItemGroupSelect(event: CustomEvent<{ itemGroup: any }>) {
    selectedGroup = event.detail.itemGroup;
    selectedGroupId = selectedGroup?.id || '';
  }
  
  // Submit form
  async function handleSubmit() {
    // Validate form
    if (!itemCode.trim()) {
      error = 'Item code is required';
      return;
    }
    
    if (!selectedGroupId) {
      error = 'Please select an item group';
      return;
    }
    
    isSubmitting = true;
    error = '';
    
    try {
      // Submit to API
      const response = await fetch('/api/stock/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          item_code: itemCode.trim(),
          item_group_id: selectedGroupId
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create item');
      }
      
      // Notify parent of success
      dispatch('itemAdded', { item: data.item });
      
      // Close modal
      closeModal();
    } catch (err) {
      if (err instanceof Error) {
        error = err.message;
      } else {
        error = 'An unexpected error occurred';
      }
    } finally {
      isSubmitting = false;
    }
  }
  
  // Component initialization
  onMount(() => {
    // Any initialization if needed
  });
</script>

<!-- Modal -->
{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Add New Item</h3>
      
      {#if error}
        <div class="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      {/if}
      
      <form on:submit|preventDefault={handleSubmit} class="mt-4 space-y-4">
        <!-- Item Code -->
        <div class="form-control">
          <label for="itemCode" class="label">
            <span class="label-text">Item Code</span>
          </label>
          <input
            id="itemCode"
            type="text"
            bind:value={itemCode}
            class="input input-bordered input-primary"
            placeholder="Enter item code"
          />
        </div>
        
        <!-- Item Group - Modern Searchable Select -->
        <div class="form-control">
          <label for="itemGroupSelector" class="label">
            <span class="label-text">Item Group</span>
          </label>
          <ItemGroupSelector
            selectedItemGroup={selectedGroup}
            on:select={handleItemGroupSelect}
            placeholder="Search for an item group..."
            required={true}
            searchEndpoint="/api/item-groups/search"
          />
        </div>
        
        <!-- Actions -->
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" on:click={closeModal}>
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <span class="loading loading-spinner loading-sm"></span>
              Saving...
            {:else}
              Save
            {/if}
          </button>
        </div>
      </form>
    </div>
    <div 
      class="modal-backdrop" 
      on:click={closeModal}
      on:keydown={(e) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      }}
      role="button"
      tabindex="0"
      aria-label="Close modal"
    ></div>
  </div>
{/if}
