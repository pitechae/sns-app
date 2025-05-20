<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';
  import ItemGroupSelector from '$lib/components/item-groups/ItemGroupSelector.svelte';
  
  /**
   * Component props with TypeScript typing using SvelteKit runes
   */
  const { itemGroups, isOpen = false, title = 'Add New Item' } = $props<{
    itemGroups: Array<{
      id: string;
      name: string;
      code: string;
    }>;
    isOpen: boolean;
    title?: string;
  }>();
  
  /**
   * Local state with reactive declarations
   */
  let itemCode = $state('');
  let selectedGroupId = $state('');
  let isSubmitting = $state(false);
  let error = $state('');
  let selectedGroup = $state<(typeof itemGroups)[0] | null>(null);
  let formElement = $state<HTMLFormElement | null>(null);
  
  // Track if the modal was just opened for animations
  let wasJustOpened = $state(false);
  
  /**
   * Event dispatcher for communicating with parent component
   */
  const dispatch = createEventDispatcher<{
    close: void;
    itemAdded: { item: any };
  }>();
  
  /**
   * Reset form to initial state
   */
  function resetForm() {
    itemCode = '';
    selectedGroupId = '';
    selectedGroup = null;
    error = '';
    isSubmitting = false;
  }
  
  /**
   * Close modal and reset form
   */
  function closeModal() {
    resetForm();
    dispatch('close');
  }
  
  /**
   * Handle item group selection from the selector component
   */
  function handleItemGroupSelect(event: CustomEvent<{ itemGroup: any }>) {
    selectedGroup = event.detail.itemGroup;
    selectedGroupId = selectedGroup?.id || '';
    // Clear error if it was related to item group
    if (error === 'Please select an item group') {
      error = '';
    }
  }
  
  /**
   * Validate form inputs
   * @returns {boolean} True if form is valid
   */
  function validateForm(): boolean {
    // Check item code
    if (!itemCode.trim()) {
      error = 'Item code is required';
      return false;
    }
    
    // Check item group
    if (!selectedGroupId) {
      error = 'Please select an item group';
      return false;
    }
    
    return true;
  }
  
  /**
   * Submit form to create new item
   */
  async function handleSubmit() {
    // Validate form inputs
    if (!validateForm()) return;
    
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
  
  /**
   * Handle keyboard events for accessibility
   */
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      closeModal();
    }
  }
  
  /**
   * Focus the first input when modal opens
   */
  $effect(() => {
    if (isOpen) {
      wasJustOpened = true;
      // Use tick to wait for DOM update
      tick().then(() => {
        const firstInput = formElement?.querySelector('input, select, textarea') as HTMLElement;
        if (firstInput) {
          firstInput.focus();
        }
      });
    }
  });
  
  /**
   * Component initialization
   */
  onMount(() => {
    // Add global event listener for Escape key
    window.addEventListener('keydown', handleKeydown);
    
    return () => {
      // Clean up event listener
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<!-- Modal with improved aesthetics -->
{#if isOpen}
  <div 
    class="modal modal-open z-50" 
    transition:fade={{ duration: 150 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div 
      class="modal-box max-w-md bg-base-100 rounded-lg shadow-lg border border-base-200" 
      transition:scale={{ start: 0.95, duration: 200, opacity: 0 }}
    >
      <!-- Modal Header with improved styling -->
      <div class="flex justify-between items-center mb-6 pb-2 border-b border-base-200">
        <h3 id="modal-title" class="text-xl font-medium text-base-content">{title}</h3>
        <button 
          type="button" 
          class="btn btn-sm btn-circle btn-ghost hover:bg-base-200 transition-colors" 
          onclick={closeModal}
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Error Alert with improved styling -->
      {#if error}
        <div 
          class="rounded-md bg-error/10 border-l-4 border-error px-4 py-3 mb-6" 
          transition:fly={{ y: -10, duration: 150 }}
          role="alert"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-error">{error}</p>
            </div>
          </div>
        </div>
      {/if}
      
      <!-- Form with improved styling -->
      <form 
        bind:this={formElement}
        onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} 
        class="space-y-6"
      >
        <!-- Item Code with improved styling -->
        <div class="form-control w-full">
          <label for="itemCode" class="label pb-1">
            <span class="label-text text-base-content/80 font-medium">Item Code</span>
            <span class="label-text-alt text-error/90 text-xs">Required</span>
          </label>
          <input
            id="itemCode"
            type="text"
            bind:value={itemCode}
            class="input input-bordered w-full bg-base-100 border-base-300 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200"
            placeholder="Enter item code"
            required
            autocomplete="off"
            aria-invalid={error === 'Item code is required'}
            aria-describedby={error === 'Item code is required' ? 'itemCode-error' : undefined}
          />
          {#if error === 'Item code is required'}
            <div class="mt-1" id="itemCode-error">
              <span class="text-xs text-error">{error}</span>
            </div>
          {/if}
        </div>
        
        <!-- Item Group with improved styling -->
        <div class="form-control w-full">
          <label for="itemGroupSelector" class="label pb-1">
            <span class="label-text text-base-content/80 font-medium">Item Group</span>
            <span class="label-text-alt text-error/90 text-xs">Required</span>
          </label>
          <ItemGroupSelector
            selectedItemGroup={selectedGroup}
            on:select={handleItemGroupSelect}
            placeholder="Search for an item group..."
            required={true}
            searchEndpoint="/api/item-groups/search"
          />
          {#if error === 'Please select an item group'}
            <div class="mt-1" id="itemGroup-error">
              <span class="text-xs text-error">{error}</span>
            </div>
          {/if}
        </div>
        
        <!-- Actions with improved styling -->
        <div class="flex justify-end items-center gap-3 pt-4 mt-6 border-t border-base-200">
          <button 
            type="button" 
            class="btn btn-sm px-4 border-base-300 hover:bg-base-200 hover:border-base-300 text-base-content" 
            onclick={closeModal}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-sm btn-primary px-4 hover:bg-primary-focus transition-colors"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {#if isSubmitting}
              <span class="loading loading-spinner loading-xs mr-1"></span>
              Saving...
            {:else}
              Save Item
            {/if}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Modal Backdrop with improved styling -->
    <div 
      class="modal-backdrop bg-neutral/60 backdrop-blur-sm" 
      onclick={closeModal}
      onkeydown={(e) => e.key === 'Escape' && closeModal()}
      role="button"
      tabindex="-1"
      aria-label="Close modal"
    ></div>
  </div>
{/if}
