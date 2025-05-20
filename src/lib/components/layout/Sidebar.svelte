<script lang="ts">
  export let activeTab: string = 'dashboard';
</script>

<aside class="w-64 h-full bg-base-100 text-base-content flex flex-col border-r border-base-200">
  <!-- Logo and brand -->
  <div class="p-4 border-b border-base-200">
    <a href="/" class="text-primary font-bold text-xl flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span>SNS ERP</span>
    </a>
  </div>
  
  <!-- Main navigation -->
  <div class="overflow-y-auto flex-1 py-4">
    <div class="px-3 pb-2">
      <h2 class="text-xs font-semibold text-base-content/60 uppercase tracking-wider px-3">Main</h2>
    </div>
    <ul class="menu menu-sm px-3 gap-1">
      <li>
        <a 
          href="/dashboard" 
          class="flex items-center gap-3 rounded-lg {activeTab === 'dashboard' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </a>
      </li>
      <li>
        <a 
          href="/finance" 
          class="flex items-center gap-3 rounded-lg {activeTab === 'finance' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Finance
        </a>
      </li>
    </ul>
    
    <div class="px-3 py-4">
      <h2 class="text-xs font-semibold text-base-content/60 uppercase tracking-wider px-3">Commerce</h2>
    </div>
    <ul class="menu menu-sm px-3 gap-1">
      <li>
        <a 
          href="/e-commerce" 
          class="flex items-center gap-3 rounded-lg {activeTab === 'ecommerce' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          E-Commerce
        </a>
      </li>
      <li>
        <a 
          href="/campaigns" 
          class="flex items-center gap-3 rounded-lg {activeTab === 'campaigns' ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          Campaigns
        </a>
      </li>
    </ul>
  </div>
  
  <!-- User section -->
  <div class="p-4 border-t border-base-200">
    <div class="flex items-center gap-3">
      <div class="avatar placeholder">
        <div class="bg-primary text-primary-content rounded-full w-10">
          <span>SA</span>
        </div>
      </div>
      <div>
        <p class="font-medium">Admin User</p>
        <p class="text-xs text-base-content/70">System Administrator</p>
      </div>
    </div>
  </div>
</aside>
