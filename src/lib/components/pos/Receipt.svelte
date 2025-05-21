<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Transaction, TransactionItem } from '$lib/types/pos';
  
  // Props
  export let transaction: Transaction;
  export let businessInfo = {
    name: 'SNS Store',
    address: '123 Main St, City, Country',
    phone: '+1 (555) 123-4567',
    email: 'info@snsstore.com'
  };
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    print: { transaction: Transaction; businessInfo: any };
  }>();
  
  // Format date
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  // Format time
  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
  
  // Format price
  function formatPrice(price: number): string {
    return price.toFixed(2);
  }
  
  // Print receipt
  function printReceipt() {
    dispatch('print', { transaction, businessInfo });
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden font-mono text-sm">
  <!-- Receipt header -->
  <div class="p-4 bg-gray-50 border-b border-gray-200 text-center">
    <h3 class="font-bold text-lg uppercase">{businessInfo.name}</h3>
    <p>{businessInfo.address}</p>
    <p>{businessInfo.phone}</p>
    <p class="text-xs">{businessInfo.email}</p>
    <div class="border-t border-gray-300 my-2"></div>
    <p>Receipt: {transaction.id}</p>
    <p>Date: {formatDate(transaction.date)}</p>
    <p>Time: {formatTime(transaction.date)}</p>
  </div>
  
  <!-- Receipt items -->
  <div class="p-4">
    <div class="border-b border-gray-300 mb-2 pb-1 font-bold flex">
      <span class="flex-1">ITEM</span>
      <span class="w-10 text-center">QTY</span>
      <span class="w-16 text-right">PRICE</span>
    </div>
    
    {#each transaction.items as item}
      <div class="flex py-1 text-xs">
        <span class="flex-1 truncate">{item.name}</span>
        <span class="w-10 text-center">{item.quantity}</span>
        <span class="w-16 text-right">${formatPrice(item.price * item.quantity)}</span>
      </div>
    {/each}
    
    <div class="border-t border-gray-300 mt-2 pt-2">
      <div class="flex justify-between font-bold">
        <span>TOTAL</span>
        <span>${formatPrice(transaction.total)}</span>
      </div>
      
      <div class="flex justify-between mt-1">
        <span>PAYMENT</span>
        <span>{transaction.paymentMethod}</span>
      </div>
      
      <div class="flex justify-between">
        <span>STATUS</span>
        <span class="uppercase">{transaction.status}</span>
      </div>
    </div>
  </div>
  
  <!-- Receipt footer -->
  <div class="p-4 bg-gray-50 border-t border-gray-200 text-center text-xs">
    <p>Thank you for your purchase!</p>
    <p>Please come again</p>
    
    <button 
      class="btn btn-sm btn-outline mt-4 w-full"
      onclick={printReceipt}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      Print Receipt
    </button>
  </div>
</div>
