<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { successToast, errorToast } from '$lib/stores/toastStore';
  import type { PageData } from './$types';
  import StockEntryForm from '$lib/components/stock-entries/StockEntryForm.svelte';
  import StockEntriesTable from '$lib/components/stock-entries/StockEntriesTable.svelte';
  import DeleteConfirmationModal from '$lib/components/stock-entries/DeleteConfirmationModal.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';

  // Get data from server load function
  export let data: PageData;

  // Define the stock entry type for TypeScript
  interface StockEntry {
    id: string;
    item_id: string;
    quantity: number;
    unit: string;
    rate: number;
    type: string;
    supplier?: string;
    invoice_number?: string;
    entry_date: number;
    created_at: number;
    item_name: string;
    item_code: string;
  }

  // Extract items for dropdown from data
  let items = data.items || [];

  // State for stock entries and pagination
  let stockEntries: StockEntry[] = [];
  let pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null = null;

  // State for UI
  let isLoading = true;
  let search = $page.url.searchParams.get('search') || '';
  let showForm = false;
  let showDeleteModal = false;

  // Stock entry being edited or created
  let editingStockEntry: {
    id?: string;
    item_id: string;
    quantity: number;
    unit: string;
    rate: number;
    type: string;
    supplier?: string;
    invoice_number?: string;
    entry_date?: number;
  } | null = null;

  // Stock entry to be deleted
  let deletingStockEntry: {
    id: string;
    item_name: string;
  } | null = null;

  // Function to refresh stock entries data
  async function refreshStockEntries() {
    isLoading = true;

    try {
      // Build URL with search and pagination params from current URL
      const url = new URL('/api/stock/entries', window.location.origin);
      const searchParam = $page.url.searchParams.get('search');
      const pageParam = $page.url.searchParams.get('page');
      const limitParam = $page.url.searchParams.get('limit');

      if (searchParam) url.searchParams.set('search', searchParam);
      if (pageParam) url.searchParams.set('page', pageParam);
      if (limitParam) url.searchParams.set('limit', limitParam);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch stock entries');
      }

      const result = await response.json();
      stockEntries = result.stockEntries || [];
      pagination = result.pagination || null;
    } catch (error) {
      console.error('Error fetching stock entries:', error);
      errorToast('Failed to fetch stock entries');
    } finally {
      isLoading = false;
    }
  }

  // Handle search input
  let searchTimeout: NodeJS.Timeout;
  function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const url = new URL(window.location.href);

      if (search) {
        url.searchParams.set('search', search);
      } else {
        url.searchParams.delete('search');
      }

      // Reset to first page when searching
      url.searchParams.set('page', '1');

      goto(url.toString(), { replaceState: true });
      refreshStockEntries();
    }, 300);
  }

  // Handle page change
  function handlePageChange(event: CustomEvent<{ page: number }>) {
    const newPage = event.detail.page;

    const url = new URL(window.location.href);
    url.searchParams.set('page', newPage.toString());

    goto(url.toString(), { replaceState: true });
    refreshStockEntries();
  }

  // Function to handle form submission
  async function handleFormSubmit(event: CustomEvent<{ stockEntry: {
    id?: string;
    item_id: string;
    quantity: number;
    unit: string;
    rate: number;
    type: string;
    supplier?: string;
    invoice_number?: string;
    entry_date?: number;
  } }>) {
    const { stockEntry } = event.detail;
    isLoading = true;
    
    try {
      if (editingStockEntry?.id) {
        // Update existing stock entry
        const response = await fetch(`/api/stock/entries/${editingStockEntry.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(stockEntry)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update stock entry');
        }
        
        successToast('Stock entry updated successfully');
      } else {
        // Create new stock entry
        const response = await fetch('/api/stock/entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(stockEntry)
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create stock entry');
        }
        
        successToast('Stock entry created successfully');
      }
      
      // Close form and refresh data
      showForm = false;
      editingStockEntry = null;
      refreshStockEntries();
    } catch (error) {
      console.error('Error saving stock entry:', error);
      errorToast(error instanceof Error ? error.message : 'Failed to save stock entry');
    } finally {
      isLoading = false;
    }
  }

  // Function to handle edit button click
  function handleEdit(entry: StockEntry) {
    editingStockEntry = {
      id: entry.id,
      item_id: entry.item_id,
      quantity: entry.quantity,
      unit: entry.unit,
      rate: entry.rate,
      type: entry.type,
      supplier: entry.supplier,
      invoice_number: entry.invoice_number,
      entry_date: entry.entry_date
    };
    showForm = true;
  }

  // Function to handle delete button click
  function handleDelete(entry: { id: string; item_name: string }) {
    // Only extract the needed properties for deletion
    deletingStockEntry = {
      id: entry.id,
      item_name: entry.item_name
    };
    showDeleteModal = true;
  }

  // Function to confirm deletion
  async function confirmDelete(id: string) {
    if (!id) return;
    
    isLoading = true;
    
    try {
      const response = await fetch(`/api/stock/entries/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete stock entry');
      }
      
      successToast('Stock entry deleted successfully');
      showDeleteModal = false;
      refreshStockEntries();
    } catch (error) {
      console.error('Error deleting stock entry:', error);
      errorToast(error instanceof Error ? error.message : 'Failed to delete stock entry');
    } finally {
      isLoading = false;
    }
  }

  // Function to add a new stock entry
  function addNewStockEntry() {
    editingStockEntry = null;
    showForm = true;
  }

  // Initialize
  onMount(() => {
    refreshStockEntries();
  });
</script>

<svelte:head>
  <title>Stock Entries Management</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
    <h1 class="text-2xl font-bold">Stock Entries Management</h1>

    <button class="btn btn-primary" on:click={addNewStockEntry}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      Add Stock Entry
    </button>
  </div>

  <!-- Search and filters -->
  <div class="card bg-base-100 shadow-xl mb-6">
    <div class="card-body">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="form-control flex-1">
          <div class="input-group">
            <input
              type="text"
              placeholder="Search by item name, code, supplier or invoice number..."
              class="input input-bordered w-full"
              bind:value={search}
              on:input={handleSearchInput}
            />
            <button class="btn btn-square" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  {#if isLoading}
    <div class="flex justify-center my-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <StockEntriesTable
          stockEntries={stockEntries}
          on:edit={e => handleEdit(e.detail.stockEntry)}
          on:delete={e => handleDelete(e.detail.stockEntry)}
        />

        {#if pagination && pagination.total > 0}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            limit={pagination.limit}
            total={pagination.total}
            on:pageChange={handlePageChange}
          />
        {/if}
      </div>
    </div>
  {/if}

  <!-- Stock Entry Form Modal -->
  {#if showForm}
    <div class="modal modal-open">
      <div class="modal-box max-w-3xl">
        <h3 class="font-bold text-lg mb-4">
          {editingStockEntry?.id ? 'Edit Stock Entry' : 'Add New Stock Entry'}
        </h3>
        <StockEntryForm 
          stockEntry={editingStockEntry || undefined}
          {items}
          on:submit={handleFormSubmit}
          on:close={() => showForm = false}
        />
      </div>
      <div class="modal-backdrop" role="button" tabindex="-1" on:click={() => showForm = false} on:keydown={e => e.key === 'Escape' && (showForm = false)}></div>
    </div>
  {/if}

  <!-- Delete Confirmation Modal -->
  {#if showDeleteModal && deletingStockEntry}
    <div class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Confirm Deletion</h3>
        <p>Are you sure you want to delete the stock entry for <span class="font-semibold">{deletingStockEntry.item_name}</span>?</p>
        <p class="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
        
        <div class="modal-action">
          <button 
            class="btn btn-outline" 
            on:click={() => showDeleteModal = false}
          >
            Cancel
          </button>
          <button 
            class="btn btn-error" 
            on:click={() => deletingStockEntry && confirmDelete(deletingStockEntry.id)}
          >
            Delete
          </button>
        </div>
      </div>
      <div class="modal-backdrop" role="button" tabindex="-1" on:click={() => showDeleteModal = false} on:keydown={e => e.key === 'Escape' && (showDeleteModal = false)}></div>
    </div>
  {/if}
</div>
