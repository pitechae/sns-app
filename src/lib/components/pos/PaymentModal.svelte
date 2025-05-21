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
      class="bg-base-100 rounded-lg shadow-lg w-full max-w-lg overflow-hidden"
      onclick={(e) => e.stopPropagation()}
      onkeydown={() => {}}
      role="dialog"
      tabindex="-1"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      transition:fly={{ y: 20, duration: 200 }}
    >
      <!-- Modal header -->
      <div class="p-4 border-b border-base-200">
        <h2 id="payment-modal-title" class="text-xl font-semibold">Payment</h2>
      </div>
      
      <!-- Modal body -->
      <div class="p-4">
        <!-- Payment summary -->
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-2">Order Summary</h3>
          <div class="bg-base-200 rounded-lg p-3">
            <div class="flex justify-between mb-2">
              <span class="text-base-content/70">Items:</span>
              <span>{cartItems.length}</span>
            </div>
            <div class="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span>${formatPrice(total)}</span>
            </div>
          </div>
        </div>
        
        <!-- Payment method selection -->
        <div class="mb-6">
          <h3 class="text-lg font-medium mb-2">Payment Method</h3>
          <div class="flex gap-2">
            <button 
              class="btn flex-1 {paymentMethod === 'CASH' ? 'btn-primary' : 'btn-outline'}"
              onclick={() => handlePaymentMethodChange('CASH')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cash
            </button>
            <button 
              class="btn flex-1 {paymentMethod === 'CARD' ? 'btn-primary' : 'btn-outline'}"
              onclick={() => handlePaymentMethodChange('CARD')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Card
            </button>
          </div>
        </div>
        
        <!-- Payment details -->
        {#if paymentMethod === 'CASH'}
          <div class="mb-6">
            <h3 class="text-lg font-medium mb-2">Cash Payment</h3>
            <div class="form-control">
              <label class="label" for="cash-amount">
                <span class="label-text">Cash Amount</span>
              </label>
              <div class="input-group">
                <span>$</span>
                <input 
                  id="cash-amount"
                  type="number" 
                  class="input input-bordered w-full" 
                  placeholder="0.00"
                  min={total}
                  step="0.01"
                  value={cashAmount}
                  oninput={handleCashAmountChange}
                />
              </div>
            </div>
            
            {#if cashAmount >= total}
              <div class="mt-4 p-3 bg-success/10 text-success rounded-lg">
                <div class="flex justify-between font-medium">
                  <span>Change Due:</span>
                  <span>${formatPrice(changeDue)}</span>
                </div>
              </div>
            {:else if cashAmount > 0}
              <div class="mt-4 p-3 bg-warning/10 text-warning rounded-lg">
                <div class="flex justify-between font-medium">
                  <span>Remaining:</span>
                  <span>${formatPrice(total - cashAmount)}</span>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <div class="mb-6">
            <h3 class="text-lg font-medium mb-2">Card Payment</h3>
            <div class="form-control mb-3">
              <label class="label" for="card-number">
                <span class="label-text">Card Number</span>
              </label>
              <input 
                id="card-number"
                type="text" 
                class="input input-bordered w-full" 
                placeholder="1234 5678 9012 3456"
                maxlength="19"
                value={cardNumber}
                oninput={handleCardNumberInput}
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label" for="card-expiry">
                  <span class="label-text">Expiry (MM/YY)</span>
                </label>
                <input 
                  id="card-expiry"
                  type="text" 
                  class="input input-bordered w-full" 
                  placeholder="MM/YY"
                  maxlength="5"
                  value={cardExpiry}
                  oninput={handleCardExpiryInput}
                />
              </div>
              
              <div class="form-control">
                <label class="label" for="card-cvc">
                  <span class="label-text">CVC</span>
                </label>
                <input 
                  id="card-cvc"
                  type="text" 
                  class="input input-bordered w-full" 
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
          <div class="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        {/if}
      </div>
      
      <!-- Modal footer -->
      <div class="p-4 border-t border-base-200 flex justify-end gap-3">
        <button 
          class="btn btn-ghost"
          onclick={closeModal}
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button 
          class="btn btn-primary {isProcessing ? 'loading' : ''}"
          onclick={processPayment}
          disabled={!isPaymentValid || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Complete Payment'}
        </button>
      </div>
    </div>
  </div>
{/if}
