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

<!-- Modal -->
{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">
        {isEditing ? 'Edit Item Group' : 'Add New Item Group'}
      </h3>
      
      {#if error}
        <div class="alert alert-error mt-4">
          <span>{error}</span>
        </div>
      {/if}
      
      <form on:submit|preventDefault={handleSubmit} class="mt-4 space-y-4">
        <!-- Name -->
        <div class="form-control">
          <label for="name" class="label">
            <span class="label-text">Name</span>
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            class="input input-bordered input-primary"
            placeholder="Enter item group name"
          />
        </div>
        
        <!-- Code -->
        <div class="form-control">
          <label for="code" class="label">
            <span class="label-text">Code</span>
          </label>
          <input
            id="code"
            type="text"
            bind:value={code}
            class="input input-bordered input-primary"
            placeholder="Enter item group code"
            maxlength="10"
          />
          <label class="label">
            <span class="label-text-alt">Code should be short and unique (max 10 characters)</span>
          </label>
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
