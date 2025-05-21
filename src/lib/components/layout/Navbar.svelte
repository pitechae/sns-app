<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Props declaration using Svelte 5 $props rune
  let { 
    user = {
      name: 'User',
      username: '@user',
      avatar: ''
    },
    showSearchBar = true,
    onSearch = (query: string) => {},
    pageTitle = 'Dashboard'
  } = $props();
  
  // Event dispatcher for search events
  const dispatch = createEventDispatcher();
  
  // State variables using Svelte 5 reactive primitives
  let searchQuery = $state('');
  let showYearly = $state(false);
  let isBackVisible = $state(window && window.history && window.history.length > 1);
  
  // Handle search submission
  function handleSearch() {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  }
  
  // Handle time period selection
  function selectTimePeriod(period: string) {
    showYearly = period === 'Yearly';
  }
  
  // Handle back navigation
  function goBack() {
    if (window && window.history && window.history.length > 1) {
      window.history.back();
    }
  }
</script>

<div class="navbar bg-base-100 border-b border-base-200 px-4 py-2 h-16 items-center shadow-sm">
  <!-- Left section with menu, back button and page title -->
  <div class="navbar-start gap-3">
    <!-- Mobile menu button - only visible on mobile -->
    <label for="drawer-toggle" class="btn btn-ghost btn-sm btn-circle drawer-button lg:hidden" aria-label="Open menu">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    </label>
    
    <!-- Back button - only shown when there's history to go back to -->
    {#if isBackVisible}
      <button 
        class="btn btn-ghost btn-sm btn-circle" 
        aria-label="Go back"
        onclick={goBack}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    {/if}
    
    <!-- Page title - visible on all screens -->
    <h1 class="text-lg font-medium hidden sm:block">{pageTitle}</h1>
  </div>
  
  <!-- Center section with search -->
  <div class="navbar-center flex-1 max-w-xl mx-4">
    <!-- Search bar - visible on all screen sizes -->
    {#if showSearchBar}
      <div class="form-control w-full">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input 
            type="text" 
            placeholder="Search products, orders, customers..." 
            class="input input-sm input-bordered w-full pl-10 focus:outline-primary" 
            bind:value={searchQuery}
            onkeyup={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button 
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/50 hover:text-primary" 
            onclick={handleSearch}
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Right section with time selector, notifications and user menu -->
  <div class="navbar-end gap-3">
    <!-- Time period selector - more compact design -->
    <div class="dropdown dropdown-end">
      <button class="btn btn-sm btn-outline normal-case flex items-center gap-1 h-9">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{showYearly ? 'Yearly' : 'Monthly'}</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40 mt-1">
        <li><button class="btn-ghost text-left" onclick={() => selectTimePeriod('Daily')}>Daily</button></li>
        <li><button class="btn-ghost text-left" onclick={() => selectTimePeriod('Weekly')}>Weekly</button></li>
        <li><button class="btn-ghost text-left" onclick={() => selectTimePeriod('Monthly')}>Monthly</button></li>
        <li><button class="btn-ghost text-left" onclick={() => selectTimePeriod('Yearly')}>Yearly</button></li>
      </ul>
    </div>
    
    <!-- Notifications - with improved indicator -->
    <div class="dropdown dropdown-end">
      <button class="btn btn-ghost btn-sm btn-circle relative" aria-label="Notifications">
        <div class="indicator">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="badge badge-xs badge-primary indicator-item animate-pulse">3</span>
        </div>
      </button>
      <div class="dropdown-content z-[1] card card-compact shadow bg-base-100 w-80 mt-1">
        <div class="card-body">
          <h3 class="font-medium text-sm mb-2">Notifications</h3>
          <ul class="menu p-0 gap-1">
            <li>
              <a href="/notifications/order" class="py-2 px-3 hover:bg-base-200 rounded-md">
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-medium">New order received</span>
                  <span class="text-xs opacity-70">5 minutes ago</span>
                </div>
              </a>
            </li>
            <li>
              <a href="/notifications/inventory" class="py-2 px-3 hover:bg-base-200 rounded-md">
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-medium">Inventory low alert</span>
                  <span class="text-xs opacity-70">1 hour ago</span>
                </div>
              </a>
            </li>
          </ul>
          <div class="card-actions justify-end mt-2">
            <a href="/notifications" class="btn btn-sm btn-ghost">View all</a>
          </div>
        </div>
      </div>
    </div>
    
    <!-- User menu - with improved styling -->
    <div class="dropdown dropdown-end">
      <button class="btn btn-ghost h-9 flex items-center gap-2 px-2">
        {#if user.avatar}
          <div class="avatar">
            <div class="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
              <img src={user.avatar} alt={user.name} />
            </div>
          </div>
        {:else}
          <div class="avatar placeholder">
            <div class="bg-primary text-primary-content rounded-full w-8">
              <span class="text-sm font-medium">{user.name.charAt(0)}</span>
            </div>
          </div>
        {/if}
        <div class="hidden md:flex flex-col items-start leading-none">
          <span class="text-sm font-medium">{user.name}</span>
          <span class="text-xs opacity-70">{user.username}</span>
        </div>
      </button>
      <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-1">
        <li><a href="/profile" class="flex gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>Profile</a></li>
        <li><a href="/settings" class="flex gap-2"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Settings</a></li>
        <div class="divider my-1"></div>
        <li><a href="/logout" class="flex gap-2 text-error"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>Logout</a></li>
      </ul>
    </div>
  </div>
</div>
