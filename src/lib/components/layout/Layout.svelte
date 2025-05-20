<script lang="ts">
  import Navbar from './Navbar.svelte';
  import Sidebar from './Sidebar.svelte';
  
  export let activeTab = 'dashboard';
  export let pageTitle = 'Dashboard';
  export let user = {
    name: 'User',
    username: '@user',
    avatar: ''
  };
  export let onSearch: (query: string) => void = () => {};
</script>

<div class="drawer lg:drawer-open">
  <input id="drawer-toggle" type="checkbox" class="drawer-toggle" />
  
  <!-- Main content -->
  <div class="drawer-content flex flex-col min-h-screen">
    <Navbar {user} {onSearch} />
    
    <main class="p-4 flex-1">
      <div class="max-w-7xl mx-auto w-full">
        <div class="mb-6">
          <h1 class="text-2xl font-bold">{pageTitle}</h1>
        </div>
        <slot></slot>
      </div>
    </main>
  </div>
  
  <!-- Sidebar / drawer side -->
  <div class="drawer-side z-20">
    <label for="drawer-toggle" class="drawer-overlay"></label>
    <Sidebar {activeTab} />
  </div>
</div>
