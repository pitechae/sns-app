<script lang="ts">
  import { fade } from 'svelte/transition';
  import StockLedger from './StockLedger.svelte';
  
  // Component props
  let { 
    isOpen = $bindable(false),
    productId = $bindable<string | null>(null),
    sku = $bindable<string | null>(null),
    productName = $bindable<string | null>(null)
  } = $props();
  
  // Close the modal
  function closeModal() {
    isOpen = false;
  }
  
  // Handle click outside the modal content
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }
  
  // Handle escape key press
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    transition:fade={{ duration: 200 }}
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-labelledby="stock-ledger-title"
  >
    <div 
      class="bg-base-100 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
      transition:fade={{ duration: 150, delay: 50 }}
    >
      <!-- Modal header -->
      <div class="p-4 border-b border-base-200 flex justify-between items-center">
        <h2 id="stock-ledger-title" class="text-xl font-medium">
          {#if productName}
            Stock Ledger: {productName}
          {:else}
            Stock Ledger
          {/if}
        </h2>
        
        <button 
          class="btn btn-sm btn-ghost"
          onclick={closeModal}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Modal content -->
      <div class="flex-1 overflow-auto p-4">
        <StockLedger {productId} {sku} />
      </div>
      
      <!-- Modal footer -->
      <div class="p-4 border-t border-base-200 flex justify-end">
        <button 
          class="btn btn-primary"
          onclick={closeModal}
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
