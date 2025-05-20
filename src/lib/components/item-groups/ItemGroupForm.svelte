<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Define props
  export let isOpen = false;
  export let isEditing = false;
  export let itemGroup: { id?: string; name: string; code: string } = { name: '', code: '' };
  
  // Local state
  let name = '';
  let code = '';
  let isSubmitting = false;
  let error = '';
  
  // Event dispatcher for communicating with parent
  const dispatch = createEventDispatcher<{
    close: void;
    save: { itemGroup: { id?: string; name: string; code: string } };
  }>();
  
  // Watch for changes in the itemGroup prop
  $: if (itemGroup) {
    name = itemGroup.name;
    code = itemGroup.code;
  }
  
  // Reset form
  function resetForm() {
    name = '';
    code = '';
    error = '';
    isSubmitting = false;
  }
  
  // Close modal
  function closeModal() {
    resetForm();
    dispatch('close');
  }
  
  // Submit form
  async function handleSubmit() {
    // Validate form
    if (!name.trim()) {
      error = 'Name is required';
      return;
    }
    
    if (!code.trim()) {
      error = 'Code is required';
      return;
    }
    
    isSubmitting = true;
    error = '';
    
    try {
      // Dispatch save event
      dispatch('save', { 
        itemGroup: { 
          ...(itemGroup.id && { id: itemGroup.id }),
          name: name.trim(), 
          code: code.trim() 
        } 
      });
      
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
</script>

<!-- Modal with improved styling -->
{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box bg-base-100 border border-base-200 shadow-lg rounded-lg p-6">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xl font-medium text-base-content">
          {isEditing ? 'Edit Item Group' : 'Add New Item Group'}
        </h3>
        <button 
          class="btn btn-sm btn-ghost btn-circle" 
          on:click={closeModal}
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <p class="text-sm text-base-content/70 mb-6">
        {isEditing ? 'Update the details of this item group.' : 'Create a new item group to categorize your inventory items.'}
      </p>
      
      {#if error}
        <div class="bg-error/10 border-l-4 border-error px-4 py-3 rounded mb-6">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-error text-sm font-medium">{error}</span>
          </div>
        </div>
      {/if}
      
      <form on:submit|preventDefault={handleSubmit} class="space-y-5">
        <!-- Name field with improved styling -->
        <div class="form-control">
          <label for="name" class="block text-sm font-medium text-base-content/80 mb-1.5">
            Name <span class="text-error">*</span>
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            class="input input-bordered w-full bg-base-100 border-base-300 focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="Enter descriptive name"
            autocomplete="off"
          />
        </div>
        
        <!-- Code field with improved styling -->
        <div class="form-control">
          <label for="code" class="block text-sm font-medium text-base-content/80 mb-1.5">
            Code <span class="text-error">*</span>
          </label>
          <input
            id="code"
            type="text"
            bind:value={code}
            class="input input-bordered w-full bg-base-100 border-base-300 focus:border-primary focus:ring-1 focus:ring-primary transition-colors font-mono"
            placeholder="SHORT_CODE"
            maxlength="10"
            autocomplete="off"
          />
          <p class="mt-1.5 text-xs text-base-content/60">
            Code should be short, unique, and without spaces (max 10 characters).
          </p>
        </div>
        
        <!-- Form actions with improved styling -->
        <div class="flex justify-end gap-3 pt-2 border-t border-base-200 mt-6">
          <button 
            type="button" 
            class="btn btn-ghost hover:bg-base-200 text-base-content/80 hover:text-base-content transition-colors" 
            on:click={closeModal}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary shadow-sm hover:shadow transition-all"
            disabled={isSubmitting}
          >
            {#if isSubmitting}
              <span class="loading loading-spinner loading-sm mr-1"></span>
              Saving...
            {:else}
              {isEditing ? 'Update' : 'Create'}
            {/if}
          </button>
        </div>
      </form>
    </div>
    <div 
      class="modal-backdrop bg-base-300/80 backdrop-blur-sm" 
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
