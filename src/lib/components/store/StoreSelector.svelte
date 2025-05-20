<script lang="ts">
  import { goto } from '$app/navigation';
  
  export let stores: Array<{
    id: string;
    name: string;
    route: string;
  }> = [];
  
  export let title = "Choose a Store";
  
  function handleStoreSelect(route: string) {
    goto(route);
  }
</script>

<div class="store-selector-container flex flex-col items-center justify-center p-6 max-w-md mx-auto">
  <h2 class="text-2xl font-bold mb-6 text-center">{title}</h2>
  
  <div class="grid grid-cols-1 gap-4 w-full">
    {#each stores as store (store.id)}
      <button 
        class="btn btn-primary btn-lg w-full"
        on:click={() => handleStoreSelect(store.route)}
      >
        {store.name}
      </button>
    {/each}
  </div>
</div>

<style>
  .store-selector-container {
    min-height: 200px;
  }
</style>
