<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fade } from 'svelte/transition';
  
  // Props
  export let enabled = true;
  
  // State
  let barcodeInput = '';
  let isListening = false;
  let timeoutId: NodeJS.Timeout | null = null;
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    scan: { barcode: string };
  }>();
  
  // Setup barcode scanning
  onMount(() => {
    if (enabled) {
      startListening();
    }
  });
  
  // Cleanup on destroy
  onDestroy(() => {
    stopListening();
  });
  
  // Watch for enabled prop changes
  $: {
    if (enabled && !isListening) {
      startListening();
    } else if (!enabled && isListening) {
      stopListening();
    }
  }
  
  // Start listening for barcode input
  function startListening() {
    // Check if we're in a browser environment before accessing window
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      isListening = true;
    }
  }
  
  // Stop listening for barcode input
  function stopListening() {
    // Check if we're in a browser environment before accessing window
    if (typeof window !== 'undefined' && isListening) {
      window.removeEventListener('keydown', handleKeyDown);
      isListening = false;
      
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    }
  }
  
  // Handle key down events
  function handleKeyDown(event: KeyboardEvent) {
    // Only process if not in an input field
    if (
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement instanceof HTMLSelectElement
    ) {
      return;
    }
    
    // Ignore modifier keys
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }
    
    // Handle Enter key to complete barcode
    if (event.key === 'Enter' && barcodeInput.length > 0) {
      event.preventDefault();
      processBarcode();
      return;
    }
    
    // Only accept alphanumeric characters and some special characters
    if (/^[a-zA-Z0-9-_]$/.test(event.key)) {
      barcodeInput += event.key;
      
      // Reset timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // Set timeout to process barcode after delay
      timeoutId = setTimeout(() => {
        if (barcodeInput.length > 3) {
          processBarcode();
        } else {
          barcodeInput = '';
        }
      }, 300);
    }
  }
  
  // Process scanned barcode
  function processBarcode() {
    if (barcodeInput.length > 0) {
      dispatch('scan', { barcode: barcodeInput });
      barcodeInput = '';
    }
  }
  
  // Handle manual barcode input
  function handleManualInput(event: Event) {
    const input = event.target as HTMLInputElement;
    barcodeInput = input.value;
  }
  
  // Handle manual barcode submit
  function handleManualSubmit(event: Event) {
    event.preventDefault();
    processBarcode();
  }
</script>

<div class="bg-base-100 border border-base-200 rounded-lg p-4">
  <h3 class="text-lg font-medium mb-4">Barcode Scanner</h3>
  
  <div class="mb-4">
    <div class="form-control">
      <label class="label cursor-pointer justify-start gap-4">
        <input 
          type="checkbox" 
          class="toggle toggle-primary" 
          checked={enabled}
          on:change={() => enabled = !enabled}
        />
        <span class="label-text">Enable barcode scanning</span>
      </label>
    </div>
  </div>
  
  {#if enabled}
    <div class="flex items-center gap-2 mb-2">
      <div class={`w-3 h-3 rounded-full ${isListening ? 'bg-success' : 'bg-error'}`}></div>
      <span class="text-sm text-base-content/70">
        {isListening ? 'Scanner active' : 'Scanner inactive'}
      </span>
    </div>
    
    <form on:submit={handleManualSubmit} class="flex gap-2">
      <input
        type="text"
        class="input input-bordered flex-1"
        placeholder="Enter barcode manually"
        value={barcodeInput}
        on:input={handleManualInput}
      />
      <button type="submit" class="btn btn-primary" aria-label="Scan barcode">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
    
    <div class="mt-4 text-sm text-base-content/70">
      <p>Scan a barcode or enter it manually to add items to the cart.</p>
    </div>
  {/if}
</div>
