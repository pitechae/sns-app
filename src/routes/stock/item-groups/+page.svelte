<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ItemGroupsTable from '$lib/components/item-groups/ItemGroupsTable.svelte';
  import ItemGroupForm from '$lib/components/item-groups/ItemGroupForm.svelte';
  import DeleteConfirmationModal from '$lib/components/item-groups/DeleteConfirmationModal.svelte';
  import BulkActions from '$lib/components/item-groups/BulkActions.svelte';
  import BulkDeleteModal from '$lib/components/item-groups/BulkDeleteModal.svelte';
  import Pagination from '$lib/components/common/Pagination.svelte';
  import { exportToCSV, exportToJSON } from '$lib/utils/exportUtils';
  import { successToast, errorToast, warningToast } from '$lib/stores/toastStore';
  import type { PageData } from './$types';
  
  // Get data from server load function
  export let data: PageData;
  
  // Define types for item groups
  type ItemGroup = {
    id: string;
    name: string;
    code: string;
    created_at: number;
  };
  
  // Local state
  let itemGroups: ItemGroup[] = Array.isArray(data.itemGroups) 
    ? data.itemGroups.map(group => ({
        ...group,
        // Ensure created_at is a number
        created_at: typeof group.created_at === 'number' 
          ? group.created_at 
          : group.created_at instanceof Date 
            ? Math.floor(group.created_at.getTime() / 1000) 
            : Math.floor(Date.now() / 1000)
      }))
    : [];
  let pagination = data.pagination;
  let search = data.search || '';
  let isLoading = false;
  
  // Modal state
  let isAddModalOpen = false;
  let isEditModalOpen = false;
  let isDeleteModalOpen = false;
  let isBulkDeleteModalOpen = false;
  let currentItemGroup: { id?: string; name: string; code: string } = { name: '', code: '' };
  let selectedItemGroupId: string | null = null;
  let selectedItemGroupName: string | null = null;
  let isDeleting = false;
  let deleteError: string | null = null;
  
  // Bulk actions state
  let selectedIds: string[] = [];
  let isProcessingBulk = false;
  let bulkDeleteError: string | null = null;
  
  // Handle search input
  let searchTimeout: NodeJS.Timeout;
  function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      updateUrl({ page: 1, search });
    }, 300);
  }
  
  // Update URL with new query parameters
  function updateUrl({ page, search }: { page?: number; search?: string }) {
    const url = new URL(window.location.href);
    
    if (page !== undefined) {
      url.searchParams.set('page', page.toString());
    }
    
    if (search !== undefined) {
      if (search) {
        url.searchParams.set('search', search);
      } else {
        url.searchParams.delete('search');
      }
    }
    
    goto(url.toString(), { replaceState: true });
  }
  
  // Handle page change
  function handlePageChange({ detail }: CustomEvent<{ page: number }>) {
    updateUrl({ page: detail.page });
  }
  
  // Open add modal
  function openAddModal() {
    currentItemGroup = { name: '', code: '' };
    isAddModalOpen = true;
  }
  
  // Open edit modal
  function openEditModal(event: CustomEvent<{ itemGroup: { id: string; name: string; code: string } }>) {
    const { itemGroup } = event.detail;
    currentItemGroup = { ...itemGroup };
    isEditModalOpen = true;
  }
  
  // Open delete modal
  function openDeleteModal(event: CustomEvent<{ itemGroup: { id: string; name: string } }>) {
    const { itemGroup } = event.detail;
    selectedItemGroupId = itemGroup.id;
    selectedItemGroupName = itemGroup.name;
    isDeleteModalOpen = true;
    deleteError = null;
  }
  
  // Close modals
  function closeAddModal() {
    isAddModalOpen = false;
  }
  
  function closeEditModal() {
    isEditModalOpen = false;
  }
  
  function closeDeleteModal() {
    isDeleteModalOpen = false;
    isDeleting = false;
    deleteError = null;
  }
  
  function closeBulkDeleteModal() {
    isBulkDeleteModalOpen = false;
    isProcessingBulk = false;
    bulkDeleteError = null;
  }
  
  // Handle selection change
  function handleSelectionChange(event: CustomEvent<{ selectedIds: string[] }>) {
    selectedIds = event.detail.selectedIds;
  }
  
  // Handle export to CSV
  function handleExportCsv() {
    try {
      // Prepare data for export (remove internal fields)
      const exportData = itemGroups.map(group => ({
        name: group.name,
        code: group.code,
        created_at: new Date(group.created_at * 1000).toISOString()
      }));
      
      // Export to CSV
      exportToCSV(exportData, `item-groups-${new Date().toISOString().split('T')[0]}.csv`);
      
      // Show success toast
      successToast('Item groups exported to CSV successfully');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      errorToast('Failed to export item groups to CSV');
    }
  }
  
  // Handle export to JSON
  function handleExportJson() {
    try {
      // Prepare data for export (remove internal fields)
      const exportData = itemGroups.map(group => ({
        name: group.name,
        code: group.code,
        created_at: new Date(group.created_at * 1000).toISOString()
      }));
      
      // Export to JSON
      exportToJSON(exportData, `item-groups-${new Date().toISOString().split('T')[0]}.json`);
      
      // Show success toast
      successToast('Item groups exported to JSON successfully');
    } catch (error) {
      console.error('Error exporting to JSON:', error);
      errorToast('Failed to export item groups to JSON');
    }
  }
  
  // Handle bulk delete
  function handleBulkDelete() {
    if (selectedIds.length > 0) {
      isBulkDeleteModalOpen = true;
    }
  }
  
  // Confirm bulk delete
  async function confirmBulkDelete() {
    if (selectedIds.length === 0) {
      return;
    }
    
    isProcessingBulk = true;
    bulkDeleteError = null;
    
    try {
      // Delete each selected item group
      const results = await Promise.allSettled(
        selectedIds.map(id =>
          fetch(`/api/stock/item-groups/${id}`, {
            method: 'DELETE'
          })
        )
      );
      
      // Count successful and failed deletions
      const successful = results.filter(result => result.status === 'fulfilled' && 
        (result as PromiseFulfilledResult<Response>).value.ok).length;
      const failed = selectedIds.length - successful;
      
      // Close modal
      closeBulkDeleteModal();
      
      // Reset selection
      selectedIds = [];
      
      // Show toast
      if (failed === 0) {
        successToast(`Successfully deleted ${successful} item group${successful !== 1 ? 's' : ''}`);
      } else {
        warningToast(`Deleted ${successful} item group${successful !== 1 ? 's' : ''}, but failed to delete ${failed} item group${failed !== 1 ? 's' : ''}`);
      }
      
      // Refresh the data
      refreshItemGroups();
    } catch (error) {
      console.error('Error performing bulk delete:', error);
      isProcessingBulk = false;
      bulkDeleteError = error instanceof Error ? error.message : 'Failed to delete item groups';
    }
  }
  
  // Save item group (create or update)
  async function saveItemGroup({ detail }: CustomEvent<{ itemGroup: { id?: string; name: string; code: string } }>) {
    const { itemGroup } = detail;
    const isEditing = !!itemGroup.id;
    
    try {
      const response = await fetch(
        isEditing ? `/api/stock/item-groups/${itemGroup.id}` : '/api/stock/item-groups',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(itemGroup)
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save item group');
      }
      
      // Close the modal
      if (isEditing) {
        closeEditModal();
      } else {
        closeAddModal();
      }
      
      // Show success toast
      successToast(`Item group ${isEditing ? 'updated' : 'created'} successfully`);
      
      // Refresh the data
      refreshItemGroups();
    } catch (error) {
      console.error('Error saving item group:', error);
      errorToast(error instanceof Error ? error.message : 'Failed to save item group');
    }
  }
  
  // Confirm delete
  async function confirmDelete() {
    if (!selectedItemGroupId) return;
    
    isDeleting = true;
    deleteError = null;
    
    try {
      const response = await fetch(`/api/stock/item-groups/${selectedItemGroupId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete item group');
      }
      
      // Show success toast
      successToast('Item group deleted successfully');
      
      // Close the modal and refresh the data
      closeDeleteModal();
      refreshItemGroups();
    } catch (error) {
      console.error('Error deleting item group:', error);
      isDeleting = false;
      deleteError = error instanceof Error ? error.message : 'Failed to delete item group';
    }
  }
  
  // Refresh item groups
  async function refreshItemGroups() {
    isLoading = true;
    
    try {
      // Get current URL parameters
      const url = new URL(window.location.href);
      const page = url.searchParams.get('page') || '1';
      const search = url.searchParams.get('search') || '';
      
      // Fetch item groups
      const response = await fetch(`/api/stock/item-groups?page=${page}&search=${search}`);
      const data = await response.json();
      
      if (response.ok) {
        itemGroups = data.data;
        pagination = data.pagination;
      }
    } catch (error) {
      console.error('Failed to refresh item groups:', error);
    } finally {
      isLoading = false;
    }
  }
  
  // Watch for URL changes
  $: {
    // When the URL changes, update the search input
    search = $page.url.searchParams.get('search') || '';
  }
</script>

<svelte:head>
  <title>Item Groups Management | SNS App</title>
  <meta name="description" content="Manage item groups for inventory categorization" />
</svelte:head>

<div class="w-full max-w-7xl mx-auto" in:fade={{ duration: 250, delay: 100 }}>
  <!-- Page header with improved styling -->
  <header class="mb-8">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-medium text-base-content">Item Groups Management</h1>
        <p class="text-base-content/70 mt-1.5">Create and manage item categories for your inventory</p>
      </div>
      
      <button 
        class="btn btn-primary shadow-sm hover:shadow transition-all duration-200"
        on:click={openAddModal}
        aria-label="Add new item group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 mr-2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add Item Group
      </button>
    </div>
  </header>
  
  <!-- Search and filters with improved styling -->
  <div class="bg-base-100 border border-base-200 rounded-lg shadow-sm mb-8 overflow-hidden">
    <div class="p-4">
      <div class="flex flex-col md:flex-row gap-5 items-center justify-between">
        <!-- Search input with improved styling -->
        <div class="form-control w-full md:max-w-md">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search by name or code..." 
              class="input input-bordered w-full pl-10 bg-base-100 border-base-300 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200" 
              bind:value={search}
              on:input={handleSearchInput}
              aria-label="Search item groups"
            />
            {#if search}
              <button 
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-base-content/40 hover:text-base-content transition-colors"
                on:click={() => { search = ''; handleSearchInput(); }}
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            {/if}
          </div>
        </div>
        
        <!-- Refresh button -->
        <button 
          class="btn btn-sm btn-ghost hover:bg-base-200 text-base-content/70 hover:text-base-content transition-colors" 
          on:click={refreshItemGroups}
          aria-label="Refresh item groups"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span class="hidden sm:inline">Refresh</span>
        </button>
      </div>
      
      <!-- Search results count -->
      {#if search}
        <div class="mt-3 text-sm text-base-content/70">
          Found {pagination?.total || 0} {pagination?.total === 1 ? 'item group' : 'item groups'} matching "{search}"
          {#if pagination?.total === 0 && search}
            <button class="btn btn-xs btn-ghost ml-2" on:click={() => { search = ''; handleSearchInput(); }}>Clear search</button>
          {/if}
        </div>
      {/if}
      
      <!-- Bulk actions with improved styling -->
      {#if pagination && pagination.total > 0 && selectedIds.length > 0}
        <div class="mt-4 pt-4 border-t border-base-200">
          <BulkActions 
            selectedIds={selectedIds} 
            totalCount={pagination.total} 
            isProcessing={isProcessingBulk}
            on:exportCsv={handleExportCsv}
            on:exportJson={handleExportJson}
            on:bulkDelete={handleBulkDelete}
          />
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Main content area with improved styling -->
  <div class="bg-base-100 border border-base-200 rounded-lg shadow-sm overflow-hidden">
    {#if isLoading}
      <!-- Loading state with improved styling -->
      <div class="flex flex-col items-center justify-center py-16">
        <div class="loading loading-spinner loading-md text-primary"></div>
        <p class="mt-4 text-base-content/70 text-sm">Loading item groups...</p>
      </div>
    {:else if itemGroups.length === 0}
      <!-- Empty state with improved styling -->
      <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div class="bg-base-200/50 rounded-full p-4 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-base-content/40" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-base-content mb-2">No item groups found</h3>
        <p class="text-base-content/70 max-w-md mb-6">
          {search ? `No item groups matching "${search}" were found.` : 'You haven\'t created any item groups yet. Item groups help you organize your inventory items.'}
        </p>
        <button class="btn btn-primary btn-sm" on:click={openAddModal}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 mr-1.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create your first item group
        </button>
      </div>
    {:else}
      <!-- Table with improved styling -->
      <div class="overflow-x-auto">
        <ItemGroupsTable 
          {itemGroups} 
          selectable={true}
          on:edit={openEditModal}
          on:delete={openDeleteModal}
          on:selectionChange={handleSelectionChange}
        />
      </div>
      
      <!-- Pagination with improved styling -->
      {#if pagination && pagination.total > 0}
        <div class="border-t border-base-200 p-4">
          <Pagination 
            currentPage={pagination.page} 
            totalPages={pagination.totalPages}
            limit={pagination.limit}
            total={pagination.total}
            on:pageChange={handlePageChange}
          />
        </div>
      {/if}
    {/if}
  </div>
</div>

<!-- Modals with improved styling -->
<div aria-live="polite">
  <!-- Add Item Group Modal with improved styling -->
  <ItemGroupForm 
    isOpen={isAddModalOpen}
    isEditing={false}
    itemGroup={{ name: '', code: '' }}
    on:close={closeAddModal}
    on:save={saveItemGroup}
  />
  
  <!-- Edit Item Group Modal with improved styling -->
  <ItemGroupForm 
    isOpen={isEditModalOpen}
    isEditing={true}
    itemGroup={currentItemGroup}
    on:close={closeEditModal}
    on:save={saveItemGroup}
  />
  
  <!-- Delete Confirmation Modal with improved styling -->
  <DeleteConfirmationModal 
    isOpen={isDeleteModalOpen}
    itemGroupId={selectedItemGroupId}
    itemGroupName={selectedItemGroupName}
    {isDeleting}
    error={deleteError}
    on:close={closeDeleteModal}
    on:confirm={confirmDelete}
  />
  
  <!-- Bulk Delete Modal with improved styling -->
  <BulkDeleteModal
    isOpen={isBulkDeleteModalOpen}
    count={selectedIds.length}
    isDeleting={isProcessingBulk}
    error={bulkDeleteError}
    on:close={closeBulkDeleteModal}
    on:confirm={confirmBulkDelete}
  />
</div>
