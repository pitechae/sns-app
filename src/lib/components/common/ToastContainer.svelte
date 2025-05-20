<script lang="ts">
  import { onDestroy } from 'svelte';
  import Toast from './Toast.svelte';
  import toastStore, { type Toast as ToastType } from '$lib/stores/toastStore';
  
  // Local state to store toasts
  let toasts: ToastType[] = [];
  
  // Subscribe to toast store
  const unsubscribe = toastStore.subscribe(value => {
    toasts = value;
  });
  
  // Clean up subscription on component destroy
  onDestroy(unsubscribe);
</script>

{#each toasts as toast (toast.id)}
  <Toast 
    message={toast.message}
    type={toast.type}
    duration={toast.duration || 3000}
    position={toast.position || 'top-right'}
  />
{/each}
