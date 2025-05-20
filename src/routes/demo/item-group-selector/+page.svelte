<script lang="ts">
  import { onMount } from 'svelte';
  import ItemGroupSelector from '$lib/components/item-groups/ItemGroupSelector.svelte';
  import SearchableSelect from '$lib/components/common/SearchableSelect.svelte';
  
  // State
  let selectedItemGroup: any = null;
  let selectedOption: any = null;
  let demoItemGroups: any[] = [];
  let demoOptions: any[] = [];
  
  // Generate demo item groups
  function generateDemoItemGroups() {
    const itemGroups = [];
    const categories = ['SHIRT', 'PANT', 'SHOE', 'HAT', 'JACKET', 'SOCK', 'BELT', 'TIE'];
    const prefixes = ['BOY\'S', 'GIRL\'S', 'MEN\'S', 'WOMEN\'S', 'KIDS\'', 'ADULT\'S', 'TEEN\'S', 'BABY\'S'];
    
    for (let i = 0; i < 100; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const code = `${category.substring(0, 2)}${i.toString().padStart(3, '0')}`;
      
      itemGroups.push({
        id: `group-${i}`,
        name: `${prefix} ${category}`,
        code: code
      });
    }
    
    return itemGroups;
  }
  
  // Generate demo options for the generic SearchableSelect
  function generateDemoOptions() {
    const options = [];
    const colors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange'];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    
    for (let i = 0; i < 100; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      const value = `OPT${i.toString().padStart(3, '0')}`;
      
      options.push({
        id: `option-${i}`,
        label: `${color} - Size ${size}`,
        value: value
      });
    }
    
    return options;
  }
  
  // Mock API endpoints for demo
  async function mockSearchEndpoint(url: string) {
    const params = new URLSearchParams(url.split('?')[1]);
    const query = params.get('q') || '';
    const page = parseInt(params.get('page') || '1');
    const limit = parseInt(params.get('limit') || '20');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter items based on search query
    const filteredItemGroups = demoItemGroups.filter(itemGroup => 
      itemGroup.name.toLowerCase().includes(query.toLowerCase()) || 
      itemGroup.code.toLowerCase().includes(query.toLowerCase())
    );
    
    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItemGroups = filteredItemGroups.slice(startIndex, endIndex);
    
    return {
      itemGroups: paginatedItemGroups,
      pagination: {
        page,
        limit,
        total: filteredItemGroups.length,
        totalPages: Math.ceil(filteredItemGroups.length / limit)
      }
    };
  }
  
  // Handle item group selection
  function handleSelect(event: CustomEvent<{ itemGroup: any }>) {
    selectedItemGroup = event.detail.itemGroup;
    console.log('Selected item group:', selectedItemGroup);
  }
  
  // Handle generic option selection
  function handleOptionSelect(event: CustomEvent<{ item: any }>) {
    selectedOption = event.detail.item;
    console.log('Selected option:', selectedOption);
  }
  
  // Initialize
  onMount(() => {
    demoItemGroups = generateDemoItemGroups();
    demoOptions = generateDemoOptions();
    
    // Mock fetch for demo purposes
    window.fetch = async (url: string) => {
      if (typeof url !== 'string') return new Response(null, { status: 404 });
      
      try {
        let data;
        
        if (url.startsWith('/api/item-groups/search')) {
          data = await mockSearchEndpoint(url);
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
  <title>Item Group Selector Demo</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Modern Item Group Selector</h1>
  
  <div class="card bg-base-100 shadow-xl mb-8">
    <div class="card-body">
      <h2 class="card-title mb-4">Item Group Selector</h2>
      <p class="mb-4">Optimized for large datasets with search, autocomplete, and keyboard navigation.</p>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Select an item group</span>
        </label>
        
        <ItemGroupSelector
          {selectedItemGroup}
          on:select={handleSelect}
          placeholder="Search for item group..."
        />
      </div>
      
      {#if selectedItemGroup}
        <div class="mt-4">
          <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <div class="font-semibold">Selected Item Group:</div>
              <div>{selectedItemGroup.name} ({selectedItemGroup.code})</div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
  
  <div class="card bg-base-100 shadow-xl mb-8">
    <div class="card-body">
      <h2 class="card-title mb-4">Generic Searchable Select</h2>
      <p class="mb-4">A reusable component that can be used for any type of selection.</p>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Select an option</span>
        </label>
        
        <SearchableSelect
          items={demoOptions}
          {selectedOption}
          on:select={handleOptionSelect}
          placeholder="Search for an option..."
        />
      </div>
      
      {#if selectedOption}
        <div class="mt-4">
          <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <div class="font-semibold">Selected Option:</div>
              <div>{selectedOption.label} ({selectedOption.value})</div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
  
  <div class="card bg-base-100 shadow-xl">
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
              <td>Search with Autocomplete</td>
              <td>Debounced search with server-side filtering and highlighting</td>
            </tr>
            <tr>
              <td>Keyboard Navigation</td>
              <td>Arrow keys, Enter, Escape, and Tab support for accessibility</td>
            </tr>
            <tr>
              <td>Performance Optimization</td>
              <td>Pagination, lazy loading, and efficient DOM updates</td>
            </tr>
            <tr>
              <td>Accessibility</td>
              <td>ARIA attributes, focus management, and screen reader support</td>
            </tr>
            <tr>
              <td>Styling</td>
              <td>Clean, minimal design following DaisyUI and ShadCN UI principles</td>
            </tr>
            <tr>
              <td>Reusability</td>
              <td>Generic components that can be used for any type of selection</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
