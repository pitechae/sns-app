<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import type { CartItem, PaymentMethod, PaymentResult } from '$lib/types/pos';
  
  // Props
  export let isOpen = false;
  export let cartItems: CartItem[] = [];
  export let total: number = 0;
  
  // State
  let paymentMethod: PaymentMethod = 'CASH';
  let cashAmount: number = 0;
  let cardNumber: string = '';
  let cardExpiry: string = '';
  let cardCvc: string = '';
  let isProcessing = false;
  let error: string | null = null;
  
  // Computed values
  $: changeDue = cashAmount > total ? cashAmount - total : 0;
  $: isPaymentValid = paymentMethod === 'CASH' 
    ? cashAmount >= total 
    : cardNumber.length >= 16 && cardExpiry.length === 5 && cardCvc.length === 3;
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    close: void;
    paymentComplete: PaymentResult;
  }>();
  
  // Format price - safely handle undefined, null, or NaN values
  function formatPrice(price: number | undefined | null): string {
    if (price === undefined || price === null || isNaN(price)) return '0.00';
    try {
      return price.toFixed(2);
    } catch (err) {
      console.error('Error formatting price:', price, err);
      return '0.00';
    }
  }
  
  // Handle payment method change
  function handlePaymentMethodChange(method: PaymentMethod) {
    paymentMethod = method;
    error = null;
  }
  
  // Handle cash amount change
  function handleCashAmountChange(event: Event) {
    const input = event.target as HTMLInputElement;
    cashAmount = parseFloat(input.value) || 0;
  }
  
  // Handle card number input
  function handleCardNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Remove spaces and non-digits
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 16 digits
    if (value.length > 16) {
      value = value.slice(0, 16);
    }
    
    // Format with spaces every 4 digits
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.slice(i, i + 4));
    }
    
    cardNumber = parts.join(' ');
    
    // Update input value to formatted version
    input.value = cardNumber;
  }
  
  // Handle card expiry input
  function handleCardExpiryInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Remove non-digits and slashes
    let value = input.value.replace(/[^\d]/g, '');
    
    // Format as MM/YY
    if (value.length > 0) {
      if (value.length <= 2) {
        cardExpiry = value;
      } else {
        const month = value.slice(0, 2);
        const year = value.slice(2, 4);
        cardExpiry = `${month}/${year}`;
      }
    } else {
      cardExpiry = '';
    }
    
    // Update input value to formatted version
    input.value = cardExpiry;
  }
  
  // Process payment
  async function processPayment() {
    if (!isPaymentValid) return;
    
    isProcessing = true;
    error = null;
    
    try {
      // In a real implementation, this would call the payment API
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const result: PaymentResult = {
        success: true,
        transactionId: `TX-${Date.now().toString().slice(-6)}`
      };
      
      dispatch('paymentComplete', result);
      resetForm();
    } catch (err) {
      console.error('Payment processing error:', err);
      error = 'Failed to process payment. Please try again.';
    } finally {
      isProcessing = false;
    }
  }
  
  // Reset form
  function resetForm() {
    paymentMethod = 'CASH';
    cashAmount = 0;
    cardNumber = '';
    cardExpiry = '';
    cardCvc = '';
    error = null;
  }
  
  // Close modal
  function closeModal() {
    resetForm();
    dispatch('close');
  }
</script>

{#if isOpen}
  <!-- Modal backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 z-40"
    onclick={closeModal}
    onkeydown={(e) => e.key === 'Escape' && closeModal()}
    tabindex="-1"
    aria-hidden="true"
    transition:fade={{ duration: 200 }}
  ></div>
  
  <!-- Modal dialog -->
  <div 
    class="fixed inset-0 flex items-center justify-center z-50 p-4"
    transition:fade={{ duration: 200 }}
  >
    <div 
      class="bg-base-100 border-l-4 border-error rounded w-full max-w-lg overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      onkeydown={() => {}}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      transition:fly={{ y: 20, duration: 200 }}
    >
      <!-- Modal header -->
      <div class="p-4 border-b border-base-200 flex justify-between items-center">
        <h2 id="payment-modal-title" class="text-lg font-medium">Payment</h2>
        <button 
          class="p-1 text-base-content/40 hover:text-error transition-colors" 
          onclick={closeModal}
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Modal body -->
      <div class="p-4">
        <!-- Payment summary -->
        <div class="mb-4">
          <h3 class="text-sm font-medium mb-2 text-base-content/70">Order Summary</h3>
          <div class="border border-base-200 rounded p-3">
            <div class="flex justify-between mb-2">
              <span class="text-sm text-base-content/70">Items:</span>
              <span class="text-sm">{cartItems.length}</span>
            </div>
            <div class="flex justify-between font-medium border-t border-base-200 pt-2 mt-2">
              <span>Total:</span>
              <span class="text-error">AED {formatPrice(total)}</span>
            </div>
          </div>
        </div>
        
        <!-- Payment method selection -->
        <div class="mb-4">
          <h3 class="text-sm font-medium mb-2 text-base-content/70">Payment Method</h3>
          <div class="flex gap-2">
            <button 
              class="flex-1 py-2 px-3 rounded flex items-center justify-center transition-colors {paymentMethod === 'CASH' ? 'bg-error/10 border-error text-error' : 'border border-base-200 hover:bg-base-200/50'}"
              onclick={() => handlePaymentMethodChange('CASH')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cash
            </button>
            <button 
              class="flex-1 py-2 px-3 rounded flex items-center justify-center transition-colors {paymentMethod === 'CARD' ? 'bg-error/10 border-error text-error' : 'border border-base-200 hover:bg-base-200/50'}"
              onclick={() => handlePaymentMethodChange('CARD')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Card
            </button>
          </div>
        </div>
        
        <!-- Payment details -->
        {#if paymentMethod === 'CASH'}
          <div class="mb-4">
            <h3 class="text-sm font-medium mb-2 text-base-content/70">Cash Payment</h3>
            <div class="mb-2">
              <label class="text-xs mb-1 inline-block text-base-content/70" for="cash-amount">
                Cash Amount
              </label>
              <div class="flex border border-base-200 rounded overflow-hidden">
                <span class="bg-base-200/50 px-2 flex items-center text-sm">AED</span>
                <input 
                  id="cash-amount"
                  type="number" 
                  class="flex-1 py-2 px-2 text-sm focus:outline-none" 
                  placeholder="0.00"
                  min={total}
                  step="0.01"
                  value={cashAmount}
                  oninput={handleCashAmountChange}
                />
              </div>
            </div>
            
            {#if cashAmount >= total}
              <div class="mt-3 p-2 border-l-4 border-success bg-success/5 rounded">
                <div class="flex justify-between text-sm">
                  <span class="font-medium">Change Due:</span>
                  <span class="text-success font-medium">AED {formatPrice(changeDue)}</span>
                </div>
              </div>
            {:else if cashAmount > 0}
              <div class="mt-3 p-2 border-l-4 border-warning bg-warning/5 rounded">
                <div class="flex justify-between text-sm">
                  <span class="font-medium">Remaining:</span>
                  <span class="text-warning font-medium">AED {formatPrice(total - cashAmount)}</span>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <div class="mb-4">
            <h3 class="text-sm font-medium mb-2 text-base-content/70">Card Payment</h3>
            <div class="mb-3">
              <label class="text-xs mb-1 inline-block text-base-content/70" for="card-number">
                Card Number
              </label>
              <input 
                id="card-number"
                type="text" 
                class="w-full py-2 px-3 text-sm border border-base-200 rounded focus:outline-none focus:border-error/30" 
                placeholder="1234 5678 9012 3456"
                maxlength="19"
                value={cardNumber}
                oninput={handleCardNumberInput}
              />
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs mb-1 inline-block text-base-content/70" for="card-expiry">
                  Expiry (MM/YY)
                </label>
                <input 
                  id="card-expiry"
                  type="text" 
                  class="w-full py-2 px-3 text-sm border border-base-200 rounded focus:outline-none focus:border-error/30" 
                  placeholder="MM/YY"
                  maxlength="5"
                  value={cardExpiry}
                  oninput={handleCardExpiryInput}
                />
              </div>
              
              <div>
                <label class="text-xs mb-1 inline-block text-base-content/70" for="card-cvc">
                  CVC
                </label>
                <input 
                  id="card-cvc"
                  type="text" 
                  class="w-full py-2 px-3 text-sm border border-base-200 rounded focus:outline-none focus:border-error/30" 
                  placeholder="123"
                  maxlength="3"
                  bind:value={cardCvc}
                />
              </div>
            </div>
          </div>
        {/if}
        
        <!-- Error message -->
        {#if error}
          <div class="mb-4 p-2 border-l-4 border-error bg-error/5 text-error rounded text-sm">
            <div class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        {/if}
      </div>
      
      <!-- Modal footer -->
      <div class="p-4 border-t border-base-200 flex justify-end gap-2">
        <button 
          class="px-4 py-2 text-sm text-base-content/70 hover:bg-base-200 rounded transition-colors"
          onclick={closeModal}
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button 
          class="px-4 py-2 text-sm bg-error text-error-content rounded transition-colors hover:bg-error/90 flex items-center {isProcessing ? 'opacity-70' : ''}"
          onclick={processPayment}
          disabled={!isPaymentValid || isProcessing}
        >
          {#if isProcessing}
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-error-content" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          {:else}
            Complete Payment
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}
