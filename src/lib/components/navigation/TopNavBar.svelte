<script lang="ts">
  import { page } from '$app/stores';
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';
  
  /**
   * Props with TypeScript typing for better developer experience
   */
  export let username = 'User';
  export let seed = username; // Seed for DiceBear avatar
  export let showSearch = true;
  export let showBreadcrumbs = true;
  
  // State variables
  let isSearchFocused = false;
  let searchQuery = '';
  let mounted = false;
  
  // Event dispatcher with TypeScript types
  const dispatch = createEventDispatcher<{
    menuToggle: void;
    profileClick: void;
    helpClick: void;
    search: { query: string };
  }>();
  
  /**
   * Toggle sidebar menu - accessibility improved with keyboard support
   */
  function toggleMenu(event?: MouseEvent | KeyboardEvent) {
    if (event && event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    dispatch('menuToggle');
  }
  
  /**
   * Handle profile click with improved accessibility
   */
  function handleProfileClick(event?: MouseEvent | KeyboardEvent) {
    if (event && event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    dispatch('profileClick');
  }
  
  /**
   * Handle help click with improved accessibility
   */
  function handleHelpClick(event?: MouseEvent | KeyboardEvent) {
    if (event && event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    dispatch('helpClick');
  }
  
  /**
   * Handle search input with debounce
   */
  function handleSearch() {
    dispatch('search', { query: searchQuery });
  }
  
  /**
   * Handle keyboard shortcuts
   */
  function handleKeydown(event: KeyboardEvent) {
    // Ctrl+O to focus search
    if (event.ctrlKey && event.key === 'o') {
      event.preventDefault();
      isSearchFocused = true;
      document.querySelector<HTMLInputElement>('#global-search')?.focus();
    }
  }
  
  // Generate DiceBear avatar URL with proper encoding
  $: avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=2a323c&textColor=ffffff`;
  
  // Get current path segments for breadcrumbs
  $: pathSegments = $page.url.pathname.split('/').filter(Boolean);
  
  // Format segment for display (capitalize, replace dashes with spaces)
  function formatSegment(segment: string): string {
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }
  
  // Add event listener for keyboard shortcuts
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    mounted = true;
    
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<header class="bg-neutral text-neutral-content shadow-md">
  <div class="container mx-auto px-4 h-16 flex items-center justify-between">
    <!-- Left section: Logo and breadcrumbs -->
    <div class="flex items-center space-x-4">
      <!-- Menu toggle for mobile -->
      <button 
        class="lg:hidden btn btn-ghost btn-square"
        on:click={toggleMenu}
        on:keydown={toggleMenu}
        aria-label="Toggle navigation menu"
        aria-expanded="false"
        tabindex="0"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      
      <!-- Logo -->
      <a href="/" class="flex items-center focus:outline-none focus:ring-2 focus:ring-primary rounded-md">
        <img src="/logo.png" alt="SNS App Logo" class="h-8 w-auto" />
      </a>
      
      <!-- Breadcrumbs -->
      {#if showBreadcrumbs && pathSegments.length > 0}
        <nav aria-label="Breadcrumb" class="hidden sm:flex items-center space-x-2">
          <ol class="flex items-center space-x-2">
            {#each pathSegments as segment, i}
              <li class="flex items-center">
                {#if i > 0}
                  <span class="text-neutral-content/50 mx-1" aria-hidden="true">/</span>
                {/if}
                <a 
                  href={`/${pathSegments.slice(0, i + 1).join('/')}`} 
                  class="text-sm hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-md px-1"
                  aria-current={i === pathSegments.length - 1 ? 'page' : undefined}
                >
                  {formatSegment(segment)}
                </a>
              </li>
            {/each}
          </ol>
        </nav>
      {/if}
    </div>
    
    <!-- Right section: Search and profile -->
    <div class="flex items-center space-x-2">
      <!-- Search -->
      {#if showSearch}
        <div class="relative hidden md:block" transition:fade={{ duration: 150 }}>
          <div class="flex items-center bg-base-300/20 rounded-md px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-neutral-content/50 mr-2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              id="global-search"
              type="search" 
              bind:value={searchQuery}
              on:input={handleSearch}
              placeholder="Search or type a command (Ctrl + O)" 
              class="bg-transparent border-none outline-none text-sm w-64 placeholder-neutral-content/50"
              aria-label="Search"
            />
            <kbd class="text-xs bg-base-300/30 px-1.5 py-0.5 rounded text-neutral-content/50 ml-2" aria-hidden="true">
              Ctrl+O
            </kbd>
          </div>
        </div>
      {/if}
      
      <!-- Help -->
      <div class="dropdown dropdown-end">
        <button 
          class="btn btn-ghost btn-sm"
          on:click={handleHelpClick}
          on:keydown={handleHelpClick}
          aria-label="Help menu"
          aria-haspopup="true"
          tabindex="0"
        >
          <span>Help</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 ml-1" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
      
      <!-- Profile -->
      <div class="dropdown dropdown-end">
        <button 
          class="btn btn-ghost btn-circle avatar"
          on:click={handleProfileClick}
          on:keydown={handleProfileClick}
          aria-label="User profile"
          aria-haspopup="true"
          tabindex="0"
        >
          <div class="w-10 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
            {#if mounted}
              <img src={avatarUrl} alt={`${username}'s avatar`} class="w-full h-full object-cover" />
            {/if}
          </div>
        </button>
      </div>
    </div>
  </div>
</header>
