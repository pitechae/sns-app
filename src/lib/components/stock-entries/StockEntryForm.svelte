<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SearchableSelect from '$lib/components/common/SearchableSelect.svelte';
  
  // Define props
  export let stockEntry = {
    id: undefined as string | undefined,
    item_id: '',
    quantity: 1,
    unit: 'pcs',
    rate: 0,
    type: 'purchase',
    supplier: '',
    invoice_number: '',
    entry_date: Math.floor(Date.now() / 1000)
  };
  
  export let items: Array<{
    id: string;
    name: string;
    item_code: string;
  }> = [];
  
  export let isSubmitting = false;
  export let error: string | null = null;
  
  // Local state for form
  let formData = { ...stockEntry };
  let entryDate = stockEntry.entry_date 
    ? new Date(stockEntry.entry_date * 1000).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  
  // Common units
  const unitOptions = ['pcs', 'kg', 'g', 'l', 'ml', 'box', 'carton', 'dozen', 'pair'];
  
  // Entry types
  const typeOptions = ['purchase', 'transfer', 'return', 'adjustment', 'sale'];
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    close: void;
    submit: { stockEntry: typeof formData };
  }>();
  
  // Close modal
  function closeModal() {
    dispatch('close');
  }
  
  // Handle form submission
  function handleSubmit() {
    // Convert date string to timestamp
    const dateTimestamp = entryDate 
      ? Math.floor(new Date(entryDate).getTime() / 1000)
      : Math.floor(Date.now() / 1000);
    
    // Ensure quantity is a number
    const quantity = typeof formData.quantity === 'string' 
      ? parseFloat(formData.quantity) 
      : formData.quantity;
      
    // Ensure rate is a number
    const rate = typeof formData.rate === 'string' 
      ? parseFloat(formData.rate) 
      : formData.rate;
    
    // Prepare data with proper types
    const submissionData = {
      ...formData,
      quantity: quantity,
      rate: rate,
      entry_date: dateTimestamp,
      supplier: formData.supplier || '',
      invoice_number: formData.invoice_number || '',
      type: formData.type || 'purchase'
    };
    
    // Dispatch submit event
    dispatch('submit', { stockEntry: submissionData });
  }
  
  // Reset form when props change
  $: if (stockEntry) {
    formData = { ...stockEntry };
    entryDate = stockEntry.entry_date 
      ? new Date(stockEntry.entry_date * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
  }
</script>

<!-- Form -->
<form on:submit|preventDefault={handleSubmit}>
  <!-- Item Selection -->
  <div class="form-control mb-4">
    <label for="item_id" class="label">
      <span class="label-text">Item *</span>
    </label>
    <SearchableSelect
      items={items.map((item: {id: string, name: string, item_code: string}) => ({
        id: item.id,
        label: `${item.name} (${item.item_code})`,
        value: item.item_code
      }))}
      selectedItem={formData.item_id ? (() => {
        const selectedItem = items.find((item: {id: string, name: string, item_code: string}) => item.id === formData.item_id);
        return selectedItem ? {
          id: selectedItem.id,
          label: `${selectedItem.name} (${selectedItem.item_code})`,
          value: selectedItem.item_code
        } : null;
      })() : null}
      on:select={(e) => {
        formData.item_id = e.detail.item.id;
        // Find the selected item to get additional details if needed
        const selectedItem = items.find((item: {id: string, name: string, item_code: string}) => item.id === e.detail.item.id);
        if (selectedItem) {
          console.log('Selected item:', selectedItem);
        }
      }}
      placeholder="Search for an item by name or code..."
      required={true}
      maxItems={10}
      idKey="id"
      labelKey="label"
      valueKey="value"
    />
  </div>
  
  <!-- Quantity and Unit -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="form-control">
      <label for="quantity" class="label">
        <span class="label-text">Quantity *</span>
      </label>
      <input 
        id="quantity"
        type="number" 
        class="input input-bordered" 
        bind:value={formData.quantity}
        min="0.01"
        step="0.01"
        required
      />
    </div>
    
    <div class="form-control">
      <label for="unit" class="label">
        <span class="label-text">Unit *</span>
      </label>
      <select 
        id="unit"
        class="select select-bordered" 
        bind:value={formData.unit}
        required
      >
        {#each unitOptions as unit}
          <option value={unit}>{unit}</option>
        {/each}
        <option value="custom">Custom</option>
      </select>
      {#if formData.unit === 'custom'}
        <input 
          type="text" 
          class="input input-bordered mt-2" 
          placeholder="Enter custom unit"
          bind:value={formData.unit}
          required
        />
      {/if}
    </div>
  </div>
  
  <!-- Entry Type -->
  <div class="form-control mb-4">
    <label for="type" class="label">
      <span class="label-text">Entry Type *</span>
    </label>
    <select 
      id="type"
      class="select select-bordered" 
      bind:value={formData.type}
      required
    >
      {#each typeOptions as type}
        <option value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
      {/each}
    </select>
  </div>
  
  <!-- Rate -->
  <div class="form-control mb-4">
    <label for="rate" class="label">
      <span class="label-text">Rate *</span>
    </label>
    <input 
      id="rate"
      type="number" 
      class="input input-bordered" 
      bind:value={formData.rate}
      min="0"
      step="0.01"
      required
    />
  </div>
  
  <!-- Supplier -->
  <div class="form-control mb-4">
    <label for="supplier" class="label">
      <span class="label-text">Supplier</span>
    </label>
    <input 
      id="supplier"
      type="text" 
      class="input input-bordered" 
      bind:value={formData.supplier}
      placeholder="Supplier name (optional)"
    />
  </div>
  
  <!-- Invoice Number -->
  <div class="form-control mb-4">
    <label for="invoice_number" class="label">
      <span class="label-text">Invoice Number</span>
    </label>
    <input 
      id="invoice_number"
      type="text" 
      class="input input-bordered" 
      bind:value={formData.invoice_number}
      placeholder="Invoice number (optional)"
    />
  </div>
  
  <!-- Entry Date -->
  <div class="form-control mb-4">
    <label for="entry_date" class="label">
      <span class="label-text">Date</span>
    </label>
    <input 
      id="entry_date"
      type="date" 
      class="input input-bordered" 
      bind:value={entryDate}
    />
  </div>
  
  {#if error}
    <div class="alert alert-error mt-4">
      <span>{error}</span>
    </div>
  {/if}
  
  <div class="modal-action">
    <button type="button" class="btn btn-ghost" on:click={closeModal} disabled={isSubmitting}>
      Cancel
    </button>
    <button type="submit" class="btn btn-primary" disabled={isSubmitting}>
      {#if isSubmitting}
        <span class="loading loading-spinner loading-sm"></span>
        {stockEntry.id ? 'Updating...' : 'Saving...'}
      {:else}
        {stockEntry.id ? 'Update' : 'Save'}
      {/if}
    </button>
  </div>
</form>
