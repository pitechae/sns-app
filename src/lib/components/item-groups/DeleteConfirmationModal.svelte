<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Define props
  export let isOpen = false;
  export let itemGroupId: string | null = null;
  export let itemGroupName: string | null = null;
  export let isDeleting = false;
  export let error: string | null = null;
  
  // Event dispatcher for communicating with parent
  const dispatch = createEventDispatcher<{
    close: void;
    confirm: { id: string };
  }>();
  
  // Close modal
  function closeModal() {
    dispatch('close');
  }
  
  // Confirm deletion
  function confirmDelete() {
    if (itemGroupId) {
      dispatch('confirm', { id: itemGroupId });
    }
  }
</script>

<!-- Modal -->
{#if isOpen}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">Delete Item Group</h3>
      
      <p class="py-4">
        Are you sure you want to delete the item group 
        <span class="font-semibold">{itemGroupName || 'Unknown'}</span>?
        This action cannot be undone.
      </p>
      
      {#if error}
        <div class="alert alert-error mt-2">
          <span>{error}</span>
        </div>
      {/if}
      
      <div class="modal-action">
        <button type="button" class="btn btn-ghost" on:click={closeModal} disabled={isDeleting}>
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-error"
          on:click={confirmDelete}
          disabled={isDeleting}
        >
          {#if isDeleting}
            <span class="loading loading-spinner loading-sm"></span>
            Deleting...
          {:else}
            Delete
          {/if}
        </button>
      </div>
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
