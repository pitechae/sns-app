<script lang="ts">
  import { Layout } from '$lib/components/layout';
  import { onMount } from 'svelte';
  
  // Mock data for the dashboard
  let stockItems = [
    { id: 1, name: 'T-Shirt Basic', sku: 'TS-001', category: 'Apparel', quantity: 120, threshold: 20, status: 'In Stock', image: 'https://picsum.photos/seed/tshirt/200/200' },
    { id: 2, name: 'Denim Jeans', sku: 'DJ-002', category: 'Apparel', quantity: 45, threshold: 15, status: 'In Stock', image: 'https://picsum.photos/seed/jeans/200/200' },
    { id: 3, name: 'Leather Jacket', sku: 'LJ-003', category: 'Outerwear', quantity: 12, threshold: 5, status: 'Low Stock', image: 'https://picsum.photos/seed/jacket/200/200' },
    { id: 4, name: 'Running Shoes', sku: 'RS-004', category: 'Footwear', quantity: 30, threshold: 10, status: 'In Stock', image: 'https://picsum.photos/seed/shoes/200/200' },
    { id: 5, name: 'Winter Gloves', sku: 'WG-005', category: 'Accessories', quantity: 8, threshold: 10, status: 'Low Stock', image: 'https://picsum.photos/seed/gloves/200/200' },
    { id: 6, name: 'Baseball Cap', sku: 'BC-006', category: 'Accessories', quantity: 0, threshold: 5, status: 'Out of Stock', image: 'https://picsum.photos/seed/cap/200/200' },
    { id: 7, name: 'Wool Socks', sku: 'WS-007', category: 'Accessories', quantity: 65, threshold: 15, status: 'In Stock', image: 'https://picsum.photos/seed/socks/200/200' },
    { id: 8, name: 'Sunglasses', sku: 'SG-008', category: 'Accessories', quantity: 3, threshold: 5, status: 'Low Stock', image: 'https://picsum.photos/seed/sunglasses/200/200' }
  ];
  
  // User info
  const user = {
    name: 'Bradley Lawlor',
    username: '@bradleylawlor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bradley&backgroundColor=b6e3f4'
  };
  
  // Dashboard stats
  let healthCondition = '99.1%';
  let healthChange = '+10%';
  let healthPeriod = 'Since last week';
  
  let runningService = '02';
  let totalDoctors = '06';
  
  let totalHours = '84h';
  let hoursPerDay = '+2hr Per Day';
  
  let pendingMeetings = '01';
  let meetingsPerDay = '+2 Meetings Per Day';
  
  // Calendar
  let currentMonth = 'July 2025';
  let selectedDate = 2;
  let highlightedDates = [2, 19, 27];
  
  // Average user engagement
  let avgEngagement = '2h 20m';
  let weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'Today'];
  let engagementData = [70, 85, 75, 60, 40, 30, 50];
  
  // Income data
  let weeklyAvgIncome = '$19,000';
  let incomeData = [50, 70, 90, 70, 85, 60, 75, 95, 80, 70];
  
  // Doctor list data
  let doctors = [
    { id: '01', orderID: '#FUP12131424', profile: { name: 'David Elson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=c0aede' }, date: '25 Dec 2023', time: '08:30 pm' },
    { id: '02', orderID: '#ECG12131424', profile: { name: 'Katie Sims', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Katie&backgroundColor=ffdfbf' }, date: '25 Dec 2023', time: '08:30 pm' },
    { id: '03', orderID: '#FUPECG31424', profile: { name: 'Rhonda Rhodes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rhonda&backgroundColor=d1d4f9' }, date: '25 Dec 2023', time: '08:30 pm' },
    { id: '05', orderID: '#FUPECG32424', profile: { name: 'Iva Ryan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Iva&backgroundColor=c0e5c8' }, date: '25 Dec 2023', time: '08:30 pm' },
    { id: '06', orderID: '#FUPECG32424', profile: { name: 'Kathy Pacheco', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kathy&backgroundColor=ffd5dc' }, date: '25 Dec 2023', time: '08:30 pm' }
  ];
  
  // Pending approvals
  let pendingApprovals = [
    { name: 'David Elson', specialty: 'Medicine Specialist', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=c0aede' },
    { name: 'Lorri Warf', specialty: 'Medicine Specialist', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lorri&backgroundColor=b6e3f4' },
    { name: 'Frances Swann', specialty: 'Medicine Specialist', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frances&backgroundColor=ffd5dc' }
  ];
  
  // Search and filters
  let searchQuery = '';
  let selectedCategory = 'All';
  let selectedStatus = 'All';
  let isLoading = true;
  
  const categories = ['All', 'Apparel', 'Outerwear', 'Footwear', 'Accessories'];
  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];
  
  // Stats for the inventory dashboard
  let inventoryStats = {
    totalItems: 0,
    lowStock: 0,
    outOfStock: 0,
    inStock: 0
  };
  
  // Filter items based on search query and filters
  $: filteredItems = stockItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Calculate stats
  function calculateStats() {
    inventoryStats.totalItems = stockItems.reduce((sum, item) => sum + item.quantity, 0);
    inventoryStats.lowStock = stockItems.filter(item => item.status === 'Low Stock').length;
    inventoryStats.outOfStock = stockItems.filter(item => item.status === 'Out of Stock').length;
    inventoryStats.inStock = stockItems.filter(item => item.status === 'In Stock').length;
  }
  
  // Navigation
  let activeTab = 'dashboard';
  
  // Simulate loading data
  onMount(() => {
    setTimeout(() => {
      isLoading = false;
      calculateStats();
    }, 800);
  });
  
  // Handle search
  function handleSearch(query: string) {
    console.log('Searching for:', query);
    searchQuery = query;
  }
  
  // Handle adding new stock item (mock function)
  function addNewItem() {
    alert('Add new item functionality would open a modal here');
  }
  
  // Handle editing an item (mock function)
  function editItem(id: number) {
    alert(`Edit item with ID: ${id}`);
  }
  
  // Handle deleting an item (mock function)
  function deleteItem(id: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      stockItems = stockItems.filter(item => item.id !== id);
      calculateStats();
    }
  }
  
  // Handle accepting/declining approvals
  function handleApproval(name: string, action: 'accept' | 'decline') {
    alert(`${action === 'accept' ? 'Accepted' : 'Declined'} approval for ${name}`);
    pendingApprovals = pendingApprovals.filter(approval => approval.name !== name);
  }
</script>

<Layout {activeTab} pageTitle="Dashboard" {user} onSearch={handleSearch}>
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold">Stock Management</h1>
        <p class="text-base-content/70">Monitor and manage your inventory</p>
      </div>
      <button class="btn btn-primary" on:click={addNewItem}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add New Item
      </button>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Health Condition Card -->
      <div class="card bg-base-100 border border-base-200 rounded-lg">
        <div class="card-body p-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-base-content/70">Health Condition</h3>
            <div class="badge badge-success badge-sm gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>Good</span>
            </div>
          </div>
          <div class="mt-2">
            <h2 class="text-3xl font-bold">{healthCondition}</h2>
            <p class="text-sm text-success mt-1">
              <span>{healthChange}</span>
              <span class="text-xs text-base-content/50 ml-1">{healthPeriod}</span>
            </p>
          </div>
        </div>
      </div>
      
      <!-- Running Service Card -->
      <div class="card bg-base-100 border border-base-200 rounded-lg">
        <div class="card-body p-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-base-content/70">Running Service</h3>
            <div class="badge badge-info badge-sm gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Info</span>
            </div>
          </div>
          <div class="mt-2">
            <h2 class="text-3xl font-bold">{runningService}</h2>
            <p class="text-sm text-base-content/70 mt-1">{totalDoctors} Total Doctor</p>
          </div>
        </div>
      </div>
      
      <!-- Total Hours Card -->
      <div class="card bg-base-100 border border-base-200 rounded-lg">
        <div class="card-body p-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-base-content/70">Total Hours</h3>
            <div class="badge badge-warning badge-sm gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Time</span>
            </div>
          </div>
          <div class="mt-2">
            <h2 class="text-3xl font-bold">{totalHours}</h2>
            <p class="text-sm text-base-content/70 mt-1">{hoursPerDay}</p>
          </div>
        </div>
      </div>
      
      <!-- Pending Meetings Card -->
      <div class="card bg-base-100 border border-base-200 rounded-lg">
        <div class="card-body p-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-base-content/70">Pending Meetings</h3>
            <div class="badge badge-error badge-sm gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Pending</span>
            </div>
          </div>
          <div class="mt-2">
            <h2 class="text-3xl font-bold">{pendingMeetings}</h2>
            <p class="text-sm text-base-content/70 mt-1">{meetingsPerDay}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Charts Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- User Engagement Chart -->
      <div class="card bg-base-100 shadow-md">
        <div class="card-body p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="card-title text-lg">{avgEngagement}</h3>
            <span class="text-xs text-base-content/70">Average user engagements to website</span>
          </div>
          <div class="h-40 flex items-end justify-between gap-1">
            {#each engagementData as height, i}
              <div class="relative group h-full flex items-end">
                <div 
                  class="w-8 rounded-t-md {i === engagementData.length - 1 ? 'bg-primary' : 'bg-primary/20'}"
                  style="height: {height}%"
                ></div>
                <div class="absolute bottom-0 left-0 right-0 text-center mt-2 text-xs">
                  {weekDays[i]}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
      
      <!-- Income Chart -->
      <div class="card bg-base-100 shadow-md">
        <div class="card-body p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="card-title text-lg">Your weekly average income is {weeklyAvgIncome}</h3>
            <div class="badge badge-sm">Today - High Income Rate</div>
          </div>
          <div class="h-40 flex items-end justify-between gap-1">
            {#each incomeData as height, i}
              <div class="relative group h-full flex items-end">
                <div 
                  class="w-4 rounded-t-md bg-primary"
                  style="height: {height}%"
                ></div>
              </div>
            {/each}
          </div>
          <div class="flex justify-between mt-2 text-xs text-base-content/70">
            {#each Array(10) as _, i}
              <span>{i + 10}</span>
            {/each}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Stock Items Section -->
    <div class="card bg-base-100 border border-base-200 rounded-lg mt-6">
      <div class="card-body">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h3 class="font-bold text-lg">Stock Items</h3>
          
          <div class="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <!-- Category Filter -->
            <select 
              class="select select-sm select-bordered" 
              bind:value={selectedCategory}
            >
              <option value="All">All Categories</option>
              <option value="Apparel">Apparel</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Footwear">Footwear</option>
              <option value="Accessories">Accessories</option>
            </select>
            
            <!-- Status Filter -->
            <select 
              class="select select-sm select-bordered" 
              bind:value={selectedStatus}
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
        
        <!-- Stock Items Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {#each filteredItems as item}
            <div class="card bg-base-100 border border-base-200 hover:border-primary transition-colors duration-200">
              <figure class="px-4 pt-4">
                <img src={item.image} alt={item.name} class="rounded-lg h-40 w-full object-cover" />
              </figure>
              <div class="card-body px-4 py-3">
                <h2 class="card-title text-base">{item.name}</h2>
                <p class="text-sm text-base-content/70">SKU: {item.sku}</p>
                <div class="flex justify-between items-center mt-2">
                  <span class="text-sm">Qty: {item.quantity}</span>
                  <div class="
                    badge badge-sm
                    {item.status === 'In Stock' ? 'badge-success' : ''}
                    {item.status === 'Low Stock' ? 'badge-warning' : ''}
                    {item.status === 'Out of Stock' ? 'badge-error' : ''}
                  ">
                    {item.status}
                  </div>
                </div>
                <div class="card-actions justify-end mt-2">
                  <button class="btn btn-sm btn-ghost" on:click={() => editItem(item.id)} aria-label="Edit {item.name}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button class="btn btn-sm btn-ghost text-error" on:click={() => deleteItem(item.id)} aria-label="Delete {item.name}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Doctor List Section -->
    <div class="card bg-base-100 border border-base-200 rounded-lg mt-6">
      <div class="card-body">
        <div class="flex justify-between items-center">
          <h3 class="font-bold text-lg">Doctor List</h3>
          <button class="btn btn-sm btn-ghost" aria-label="See all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div class="overflow-x-auto mt-4">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>ID</th>
                <th>Order ID</th>
                <th>Profile</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {#each doctors as doctor}
                <tr>
                  <td>{doctor.id}</td>
                  <td>{doctor.orderID}</td>
                  <td>
                    <div class="flex items-center gap-3">
                      <div class="avatar">
                        <div class="w-10 rounded-full">
                          <img src={doctor.profile.avatar} alt={doctor.profile.name} />
                        </div>
                      </div>
                      <div>
                        <div class="font-medium">{doctor.profile.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>{doctor.date}</td>
                  <td>{doctor.time}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Pending Approvals Section -->
    <div class="card bg-base-100 border border-base-200 rounded-lg mt-6">
      <div class="card-body">
        <div class="flex justify-between items-center">
          <h3 class="font-bold text-lg">Pending Approvals</h3>
          <button class="btn btn-sm btn-ghost" aria-label="See all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div class="space-y-4 mt-4">
          {#each pendingApprovals as approval}
            <div class="flex justify-between items-center p-2 border-b border-base-200 pb-4">
              <div class="flex items-center gap-3">
                <div class="avatar">
                  <div class="w-12 rounded-full">
                    <img src={approval.avatar} alt={approval.name} />
                  </div>
                </div>
                <div>
                  <h4 class="font-medium">{approval.name}</h4>
                  <p class="text-sm text-base-content/70">{approval.specialty}</p>
                </div>
              </div>
              <div class="flex gap-2">
                <button 
                  class="btn btn-primary btn-sm" 
                  on:click={() => handleApproval(approval.name, 'accept')}
                >
                  Accept
                </button>
                <button 
                  class="btn btn-outline btn-sm" 
                  on:click={() => handleApproval(approval.name, 'decline')}
                >
                  Decline
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Calendar Section -->
    <div class="card bg-base-100 border border-base-200 rounded-lg mt-6">
      <div class="card-body p-4">
        <div class="flex justify-between items-center">
          <h3 class="font-bold text-lg">{currentMonth}</h3>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-ghost btn-square" aria-label="Previous month">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button class="btn btn-sm btn-ghost btn-square" aria-label="Next month">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-7 gap-1 mt-4 text-center">
          <div class="text-xs font-medium text-base-content/70">Mo</div>
          <div class="text-xs font-medium text-base-content/70">Tu</div>
          <div class="text-xs font-medium text-base-content/70">We</div>
          <div class="text-xs font-medium text-base-content/70">Th</div>
          <div class="text-xs font-medium text-base-content/70">Fr</div>
          <div class="text-xs font-medium text-base-content/70">Sa</div>
          <div class="text-xs font-medium text-base-content/70">Su</div>
          
          <!-- Calendar days -->
          {#each Array(31) as _, i}
            <div 
              class="aspect-square flex items-center justify-center text-sm rounded-lg hover:bg-base-200 transition-colors
              {highlightedDates.includes(i + 1) ? 'bg-primary/10 text-primary font-medium' : ''}
              {selectedDate === i + 1 ? 'border border-primary' : ''}"
            >
              {i + 1}
            </div>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="mt-6 pb-6 text-center text-sm text-base-content/50">
      © 2025 SNS ERP System. All rights reserved.
    </div>
</Layout>
