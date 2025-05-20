<script lang="ts">
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  
  // Page title for the header
  const pageTitle = $derived(getPageTitle($page.url.pathname));
  
  /**
   * Get the page title based on the current route
   */
  function getPageTitle(path: string): string {
    if (path.includes('/items')) return 'Items Management';
    if (path.includes('/item-groups')) return 'Item Groups';
    return 'Stock Management';
  }
</script>

<!-- Full width content layout -->
<div class="w-full h-full" in:fade={{ duration: 150 }}>
  <!-- Page header with breadcrumb -->
  <header class="bg-base-100 border-b border-base-200 mb-6">
    <div class="container mx-auto px-4 py-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 class="text-2xl font-bold text-base-content">{pageTitle}</h1>
          <div class="text-sm breadcrumbs">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/stock">Stock</a></li>
              {#if $page.url.pathname.includes('/items')}
                <li>Items</li>
              {:else if $page.url.pathname.includes('/item-groups')}
                <li>Item Groups</li>
              {/if}
            </ul>
          </div>
        </div>
        
        <!-- Quick navigation -->
        <div class="flex items-center space-x-2">
          <a 
            href="/stock/items" 
            class="btn btn-sm {$page.url.pathname.includes('/items') ? 'btn-primary' : 'btn-ghost'}"
            aria-current={$page.url.pathname.includes('/items') ? 'page' : undefined}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <span class="hidden sm:inline ml-1">Items</span>
          </a>
          <a 
            href="/stock/item-groups" 
            class="btn btn-sm {$page.url.pathname.includes('/item-groups') ? 'btn-primary' : 'btn-ghost'}"
            aria-current={$page.url.pathname.includes('/item-groups') ? 'page' : undefined}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
            </svg>
            <span class="hidden sm:inline ml-1">Item Groups</span>
          </a>
        </div>
      </div>
    </div>
  </header>
  
  <!-- Main content -->
  <main class="container mx-auto px-4 pb-8">
    <slot />
  </main>
</div>
