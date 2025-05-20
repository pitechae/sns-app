<script>
  // Active route tracking
  import { page } from '$app/stores';
  
  // Determine if a route is active
  function isActive(path) {
    return $page.url.pathname.startsWith(path);
  }
</script>

<div class="drawer lg:drawer-open">
  <input id="stock-drawer" type="checkbox" class="drawer-toggle" />
  
  <div class="drawer-content flex flex-col">
    <!-- Top navigation for mobile -->
    <div class="navbar bg-base-100 lg:hidden">
      <div class="flex-none">
        <label for="stock-drawer" class="btn btn-square btn-ghost drawer-button">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </label>
      </div>
      <div class="flex-1">
        <span class="text-xl font-bold">Stock Management</span>
      </div>
    </div>
    
    <!-- Page content -->
    <div class="p-4">
      <slot />
    </div>
  </div>
  
  <!-- Sidebar navigation -->
  <div class="drawer-side">
    <label for="stock-drawer" class="drawer-overlay"></label>
    <aside class="bg-base-200 w-64 h-full">
      <div class="p-4 text-xl font-bold hidden lg:block">Stock Management</div>
      <ul class="menu p-4 w-full text-base-content">
        <li>
          <a href="/stock/items" class={isActive('/stock/items') ? 'active' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            Items
          </a>
        </li>
        <li>
          <a href="/stock/item-groups" class={isActive('/stock/item-groups') ? 'active' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
            </svg>
            Item Groups
          </a>
        </li>
      </ul>
    </aside>
  </div>
</div>
