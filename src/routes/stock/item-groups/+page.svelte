<script lang="ts">
  import { onMount } from 'svelte';
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
  <title>Item Groups Management</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
    <h1 class="text-2xl font-bold">Item Groups Management</h1>
    
    <button 
      class="btn btn-primary"
      on:click={openAddModal}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      Add Item Group
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
              placeholder="Search by name or code..." 
              class="input input-bordered w-full" 
              bind:value={search}
              on:input={handleSearchInput}
            />
            <button class="btn btn-square" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {#if pagination && pagination.total > 0}
        <div class="mt-4">
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
  
  {#if isLoading}
    <div class="flex justify-center my-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else}
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <ItemGroupsTable 
          {itemGroups} 
          selectable={true}
          on:edit={openEditModal}
          on:delete={openDeleteModal}
          on:selectionChange={handleSelectionChange}
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
</div>

<!-- Add Item Group Modal -->
<ItemGroupForm 
  isOpen={isAddModalOpen}
  isEditing={false}
  itemGroup={{ name: '', code: '' }}
  on:close={closeAddModal}
  on:save={saveItemGroup}
/>

<!-- Edit Item Group Modal -->
<ItemGroupForm 
  isOpen={isEditModalOpen}
  isEditing={true}
  itemGroup={currentItemGroup}
  on:close={closeEditModal}
  on:save={saveItemGroup}
/>

<!-- Delete Confirmation Modal -->
<DeleteConfirmationModal 
  isOpen={isDeleteModalOpen}
  itemGroupId={selectedItemGroupId}
  itemGroupName={selectedItemGroupName}
  {isDeleting}
  error={deleteError}
  on:close={closeDeleteModal}
  on:confirm={confirmDelete}
/>
