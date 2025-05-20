<script lang="ts">
  import StoreSelector from '$lib/components/store/StoreSelector.svelte';
  
  // Store data
  const stores = [
    {
      id: 'uaq-branch',
      name: 'Smart & Style UAQ Branch',
      route: '/dashboard'
    }
  ];
</script>

<svelte:head>
  <title>Smart & Style - Store Selection</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-base-100 p-4">
  <div class="card bg-base-100 shadow-xl w-full max-w-md">
    <div class="card-body">
      <StoreSelector {stores} title="Choose a Store" />
    </div>
  </div>
</div>