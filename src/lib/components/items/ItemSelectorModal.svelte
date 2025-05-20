<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import ItemSelector from './ItemSelector.svelte';
  
  // Props
  export let isOpen = false;
  export let selectedItem: any = null;
  export let title = 'Select an Item';
  export let searchEndpoint = '/api/items/search';
  export let barcodeEndpoint = '/api/items/barcode';
  
  // Internal state
  let itemSelector: ItemSelector;
  let error: string | null = null;
  
  const dispatch = createEventDispatcher<{
    close: void;
    select: { item: any };
  }>();
  
  // Close the modal
  function closeModal() {
    isOpen = false;
    dispatch('close');
  }
  
  // Handle item selection
  function handleSelect(event: CustomEvent<{ item: any }>) {
    selectedItem = event.detail.item;
    dispatch('select', { item: selectedItem });
    closeModal();
  }
  
  // Handle errors
  function handleError(event: CustomEvent<{ message: string }>) {
    error = event.detail.message;
  }
  
  // Reset error when modal opens
  $: if (isOpen) {
    error = null;
  }
</script>

<div class="item-selector-modal {isOpen ? 'modal modal-open' : 'modal'}">
  <div class="modal-box max-w-3xl">
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-lg">{title}</h3>
      <button class="btn btn-sm btn-circle" on:click={closeModal}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    
    <div class="py-2">
      <ItemSelector
        bind:this={itemSelector}
        {selectedItem}
        {searchEndpoint}
        {barcodeEndpoint}
        placeholder="Search by name, code, or scan barcode..."
        on:select={handleSelect}
        on:error={handleError}
      />
    </div>
    
    {#if error}
      <div class="alert alert-error mt-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{error}</span>
      </div>
    {/if}
    
    <div class="modal-action">
      <button class="btn" on:click={closeModal}>Cancel</button>
    </div>
  </div>
  
  <div class="modal-backdrop" on:click={closeModal}></div>
</div>
