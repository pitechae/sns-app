<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import type { PrinterSettings } from '$lib/types/pos';
  
  // Event dispatcher
  const dispatch = createEventDispatcher();
  
  // Props
  export let settings: PrinterSettings = {
    enabled: true,
    printerName: '',
    autoPrint: true,
    useServerPrinting: false
  };
  
  // State
  let printers: string[] = [];
  let isLoading = true;
  let error: string | null = null;
  
  // Load available printers
  onMount(async () => {
    try {
      const response = await fetch('/api/pos/printers');
      const data = await response.json();
      
      if (data.printers) {
        printers = data.printers;
        
        // Set default printer if none selected
        if (settings.enabled && !settings.printerName && printers.length > 0) {
          settings.printerName = printers[0];
        }
      }
    } catch (err) {
      console.error('Error loading printers:', err);
      error = 'Failed to load available printers';
    } finally {
      isLoading = false;
    }
  });
  
  // Toggle printer enabled
  function togglePrinterEnabled() {
    settings.enabled = !settings.enabled;
  }
  
  // Toggle auto print
  function toggleAutoPrint() {
    settings.autoPrint = !settings.autoPrint;
  }
  
  // Handle printer selection
  function handlePrinterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    settings.printerName = select.value;
  }
  
  // Print test receipt
  function printTestReceipt() {
    // Create a sample transaction for testing
    const testTransaction = {
      id: `test-${Date.now()}`,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      total: 123.45,
      paymentMethod: 'CASH' as const,
      status: 'completed' as const,
      items: [
        {
          id: 'test-item-1',
          transactionId: `test-${Date.now()}`,
          productId: 'test-product-1',
          name: "BOY'S POLO SHIRT",
          price: 23.00,
          quantity: 2,
          sku: 'BPS30'
        },
        {
          id: 'test-item-2',
          transactionId: `test-${Date.now()}`,
          productId: 'test-product-2',
          name: "BOY'S SHORT PANT",
          price: 10.00,
          quantity: 1,
          sku: 'BTS140'
        }
      ]
    };
    
    // Dispatch an event to trigger the print function in the parent component
    dispatch('printTest', { transaction: testTransaction });
  }
</script>

<div class="bg-base-100 border border-base-200 rounded-lg p-4">
  <h3 class="text-lg font-medium mb-4">Receipt Printer Settings</h3>
  
  {#if isLoading}
    <div class="flex justify-center py-4">
      <div class="loading loading-spinner text-primary"></div>
    </div>
  {:else if error}
    <div class="alert alert-error">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{error}</span>
    </div>
  {:else}
    <div class="form-control mb-4">
      <label class="label cursor-pointer justify-start gap-4">
        <input 
          type="checkbox" 
          id="enable-printing"
          class="toggle toggle-primary" 
          checked={settings.enabled}
          onchange={togglePrinterEnabled}
        />
        <span class="label-text"><label for="enable-printing">Enable receipt printing</label></span>
      </label>
    </div>
    
    {#if settings.enabled}
      <div class="form-control mb-4">
        <label class="label" for="printer-select">
          <span class="label-text">Select Printer</span>
        </label>
        <select 
          id="printer-select"
          class="select select-bordered w-full"
          value={settings.printerName}
          onchange={handlePrinterChange}
        >
          {#if !settings.printerName}
            <option value="" disabled>Select a printer</option>
          {/if}
          
          {#each printers as printer}
            <option value={printer}>{printer}</option>
          {/each}
        </select>
        <div class="label">
          <span class="label-text-alt text-base-content/60">
            {printers.length === 0 ? 'No printers available' : `${printers.length} printer${printers.length !== 1 ? 's' : ''} found`}
          </span>
        </div>
      </div>
      
      <div class="form-control mb-4">
        <label class="label cursor-pointer justify-start gap-4">
          <input 
            type="checkbox" 
            id="auto-print"
            class="toggle toggle-primary" 
            checked={settings.autoPrint}
            onchange={toggleAutoPrint}
          />
          <span class="label-text"><label for="auto-print">Automatically print receipts after payment</label></span>
        </label>
      </div>
      
      <div class="form-control">
        <label class="label cursor-pointer justify-start gap-4">
          <input 
            type="checkbox" 
            id="use-server-printing"
            class="toggle toggle-primary" 
            checked={settings.useServerPrinting}
            onchange={() => settings.useServerPrinting = !settings.useServerPrinting}
          />
          <span class="label-text"><label for="use-server-printing">Use server-side printing (if disabled, will use browser printing)</label></span>
        </label>
      </div>
      
      <div class="mt-4 pt-4 border-t border-base-200">
        <button class="btn btn-sm btn-outline" onclick={printTestReceipt}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Test Receipt
        </button>
      </div>
    {/if}
  {/if}
</div>
