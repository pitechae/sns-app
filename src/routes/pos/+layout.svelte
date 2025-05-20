<script lang="ts">
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
</script>

<div class="flex flex-col min-h-screen bg-base-100">
  <!-- POS-specific header -->
  <header class="bg-base-100 border-b border-base-200 shadow-sm">
    <div class="container mx-auto px-4 py-3 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <a href="/pos" class="text-xl font-medium text-primary flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
          POS Terminal
        </a>
        <div class="hidden md:flex items-center space-x-4 ml-8">
          <a 
            href="/pos" 
            class="px-3 py-2 rounded-md text-sm font-medium {$page.url.pathname === '/pos' ? 'bg-primary/10 text-primary' : 'text-base-content/70 hover:text-base-content hover:bg-base-200'} transition-colors"
          >
            Terminal
          </a>
          <a 
            href="/pos/transactions" 
            class="px-3 py-2 rounded-md text-sm font-medium {$page.url.pathname.startsWith('/pos/transactions') ? 'bg-primary/10 text-primary' : 'text-base-content/70 hover:text-base-content hover:bg-base-200'} transition-colors"
          >
            Transactions
          </a>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <a 
          href="/" 
          class="btn btn-sm btn-ghost text-base-content/70"
          aria-label="Back to Dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span class="hidden md:inline ml-1">Dashboard</span>
        </a>
      </div>
    </div>
  </header>

  <!-- Main content area -->
  <main class="flex-grow" in:fade={{ duration: 150 }}>
    <slot />
  </main>
</div>
