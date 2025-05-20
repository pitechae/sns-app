<script lang="ts">
  import { onMount } from 'svelte';
  import ItemSelector from '$lib/components/items/ItemSelector.svelte';
  import ItemSelectorModal from '$lib/components/items/ItemSelectorModal.svelte';
  
  // State
  let selectedItem: any = null;
  let modalOpen = false;
  let demoItems: any[] = [];
  
  // Generate demo items (100,000+ items simulation)
  function generateDemoItems() {
    const items = [];
    const categories = ['Shirt', 'Pant', 'Shoe', 'Hat', 'Jacket', 'Sock', 'Belt', 'Tie'];
    const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange', 'Brown', 'Gray'];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    
    for (let i = 0; i < 100; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const itemCode = `${category.substring(0, 2).toUpperCase()}${i.toString().padStart(4, '0')}`;
      
      items.push({
        id: `item-${i}`,
        name: `${color} ${category} ${size}`,
        item_code: itemCode,
        barcode: Math.floor(Math.random() * 10000000000000).toString().padStart(13, '0')
      });
    }
    
    return items;
  }
  
  // Mock API endpoints for demo
  async function mockSearchEndpoint(url: string) {
    const params = new URLSearchParams(url.split('?')[1]);
    const query = params.get('q') || '';
    const page = parseInt(params.get('page') || '1');
    const limit = parseInt(params.get('limit') || '50');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter items based on search query
    const filteredItems = demoItems.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) || 
      item.item_code.toLowerCase().includes(query.toLowerCase())
    );
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    return {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / limit)
      }
    };
  }
  
  async function mockBarcodeEndpoint(url: string) {
    const params = new URLSearchParams(url.split('?')[1]);
    const barcode = params.get('code') || '';
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find item by barcode
    const item = demoItems.find(item => item.barcode === barcode);
    
    if (!item) {
      throw new Error('Item not found');
    }
    
    return item;
  }
  
  // Handle item selection
  function handleSelect(event: CustomEvent<{ item: any }>) {
    selectedItem = event.detail.item;
    console.log('Selected item:', selectedItem);
  }
  
  // Open the modal
  function openModal() {
    modalOpen = true;
  }
  
  // Initialize
  onMount(() => {
    demoItems = generateDemoItems();
    
    // Mock fetch for demo purposes
    window.fetch = async (url: string) => {
      if (typeof url !== 'string') return new Response(null, { status: 404 });
      
      try {
        let data;
        
        if (url.startsWith('/api/items/search')) {
          data = await mockSearchEndpoint(url);
        } else if (url.startsWith('/api/items/barcode')) {
          data = await mockBarcodeEndpoint(url);
        } else {
          return new Response(null, { status: 404 });
        }
        
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    };
  });
</script>

<svelte:head>
  <title>Item Selector Demo</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Enterprise-Grade Item Selector</h1>
  
  <div class="card bg-base-100 shadow-xl mb-8">
    <div class="card-body">
      <h2 class="card-title mb-4">Inline Item Selector</h2>
      <p class="mb-4">This component supports searching, autocomplete, virtualized list rendering, and barcode scanning.</p>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Select an item</span>
        </label>
        
        <ItemSelector
          {selectedItem}
          on:select={handleSelect}
          placeholder="Search by name, code, or scan barcode..."
        />
      </div>
      
      {#if selectedItem}
        <div class="mt-4">
          <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <div class="font-semibold">Selected Item:</div>
              <div>{selectedItem.name} ({selectedItem.item_code})</div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
  
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title mb-4">Modal Item Selector</h2>
      <p class="mb-4">For better UX, especially on mobile devices, use the modal-based selector.</p>
      
      <button class="btn btn-primary" on:click={openModal}>
        Open Item Selector Modal
      </button>
      
      <ItemSelectorModal
        bind:isOpen={modalOpen}
        bind:selectedItem
        title="Select an Item"
        on:select={handleSelect}
      />
    </div>
  </div>
  
  <div class="card bg-base-100 shadow-xl mt-8">
    <div class="card-body">
      <h2 class="card-title mb-4">Implementation Details</h2>
      
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Implementation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Barcode Input</td>
              <td>Integrated barcode scanner using device camera or manual input</td>
            </tr>
            <tr>
              <td>Search with Autocomplete</td>
              <td>Debounced search with server-side filtering and highlighting</td>
            </tr>
            <tr>
              <td>Virtualized List</td>
              <td>Only renders visible items in the viewport for optimal performance</td>
            </tr>
            <tr>
              <td>Modal-based Selection</td>
              <td>Full-screen experience on mobile, optimized for touch interfaces</td>
            </tr>
            <tr>
              <td>Performance Optimization</td>
              <td>Pagination, lazy loading, and efficient DOM updates</td>
            </tr>
            <tr>
              <td>Accessibility</td>
              <td>Keyboard navigation, ARIA attributes, and focus management</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
