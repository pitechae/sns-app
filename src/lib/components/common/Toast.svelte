<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  
  // Define props
  export let message: string;
  export let type: 'success' | 'error' | 'info' | 'warning' = 'info';
  export let duration = 3000; // Duration in milliseconds
  export let position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  
  // Local state
  let visible = true;
  let timer: ReturnType<typeof setTimeout>;
  
  // Get alert class based on type
  $: alertClass = getAlertClass(type);
  
  // Get position class
  $: positionClass = getPositionClass(position);
  
  // Set timer to hide toast after duration
  onMount(() => {
    timer = setTimeout(() => {
      visible = false;
    }, duration);
  });
  
  // Clean up timer on component destroy
  onDestroy(() => {
    clearTimeout(timer);
  });
  
  // Get alert class based on type
  function getAlertClass(type: 'success' | 'error' | 'info' | 'warning'): string {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      case 'info':
      default:
        return 'alert-info';
    }
  }
  
  // Get position class
  function getPositionClass(position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'): string {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
      default:
        return 'top-4 right-4';
    }
  }
  
  // Close toast
  function close() {
    visible = false;
    clearTimeout(timer);
  }
</script>

{#if visible}
  <div 
    class="fixed {positionClass} z-50"
    transition:fly={{ y: position.startsWith('top') ? -20 : 20, duration: 200 }}
  >
    <div class="alert {alertClass} shadow-lg">
      <div>
        {#if type === 'success'}
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {:else if type === 'error'}
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        {:else if type === 'warning'}
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        {/if}
        <span>{message}</span>
      </div>
      <div>
        <button on:click={close} class="btn btn-sm btn-ghost">✕</button>
      </div>
    </div>
  </div>
{/if}
