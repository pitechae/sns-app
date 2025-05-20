<script lang="ts">
  export let user = {
    name: 'User',
    username: '@user',
    avatar: ''
  };
  
  export let showSearchBar = true;
  export let onSearch: (query: string) => void = () => {};
  // Used in the layout component
  export const pageTitle = 'Dashboard';
  
  let searchQuery = '';
  
  function handleSearch() {
    onSearch(searchQuery);
  }
  
  let showYearly = false;
</script>

<div class="navbar bg-base-100 border-b border-base-200 px-4 py-2 h-16 items-center">
  <!-- Left section with menu and back button -->
  <div class="navbar-start gap-2">
    <!-- Mobile menu button - only visible on mobile -->
    <label for="drawer-toggle" class="btn btn-ghost btn-sm drawer-button lg:hidden" aria-label="Open menu">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    </label>
    
    <!-- Back button -->
    <button class="btn btn-ghost btn-sm" aria-label="Go back">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  </div>
  
  <!-- Center section with search -->
  <div class="navbar-center">
    <!-- Search bar - visible on all screen sizes -->
    {#if showSearchBar}
      <div class="form-control w-full max-w-md">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Search..." 
            class="input input-sm input-bordered w-full pl-10" 
            bind:value={searchQuery}
            on:keyup={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Right section with time selector, notifications and user menu -->
  <div class="navbar-end gap-2">
    <!-- Time period selector -->
    <div class="dropdown dropdown-end">
      <button class="btn btn-sm btn-outline normal-case flex items-center gap-2">
        <span>Show Yearly</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
        <li><button class="btn-ghost text-left">Daily</button></li>
        <li><button class="btn-ghost text-left">Weekly</button></li>
        <li><button class="btn-ghost text-left">Monthly</button></li>
        <li><button class="btn-ghost text-left">Yearly</button></li>
      </ul>
    </div>
    
    <!-- Notifications -->
    <div class="dropdown dropdown-end">
      <button class="btn btn-ghost btn-sm btn-circle" aria-label="Notifications">
        <div class="indicator">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="badge badge-xs badge-primary indicator-item">3</span>
        </div>
      </button>
    </div>
    
    <!-- User menu -->
    <div class="dropdown dropdown-end">
      <button class="btn btn-ghost btn-sm flex items-center gap-2">
        {#if user.avatar}
          <div class="avatar">
            <div class="w-8 rounded-full">
              <img src={user.avatar} alt={user.name} />
            </div>
          </div>
        {:else}
          <div class="avatar placeholder">
            <div class="bg-neutral-focus text-neutral-content rounded-full w-8">
              <span class="text-sm">{user.name.charAt(0)}</span>
            </div>
          </div>
        {/if}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
        <li><a href="/profile">Profile</a></li>
        <li><a href="/settings">Settings</a></li>
        <li><a href="/logout">Logout</a></li>
      </ul>
    </div>
  </div>
</div>
