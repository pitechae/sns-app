<div class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
  <!-- Product Image -->
  <figure class="px-4 pt-4">
    <img src="https://example.com/product-image.jpg" alt="Product" class="rounded-xl object-cover h-48 w-full" />
  </figure>
  
  <!-- Card Content -->
  <div class="card-body">
    <!-- Badge for status -->
    <div class="flex justify-between items-center">
      <h2 class="card-title text-lg">Sage Cotton T-Shirt</h2>
      <div class="badge badge-primary">New</div>
    </div>
    
    <!-- Product Description -->
    <p class="text-base-content/70 text-sm">Premium cotton t-shirt in our signature sage color, perfect for everyday wear.</p>
    
    <!-- Stock and Price Information -->
    <div class="flex items-center justify-between mt-2">
      <div class="flex items-center gap-2">
        <div class="badge badge-outline">In Stock</div>
        <span class="text-sm">12 items</span>
      </div>
      <div class="text-lg font-semibold">$29.99</div>
    </div>
    
    <!-- Size Selection -->
    <div class="form-control mt-2">
      <label class="label">
        <span class="label-text">Size</span>
      </label>
      <div class="join">
        <input class="join-item btn btn-sm" type="radio" name="size" aria-label="S" />
        <input class="join-item btn btn-sm" type="radio" name="size" aria-label="M" checked />
        <input class="join-item btn btn-sm" type="radio" name="size" aria-label="L" />
        <input class="join-item btn btn-sm" type="radio" name="size" aria-label="XL" />
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="card-actions justify-between items-center mt-4">
      <button class="btn btn-outline btn-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        Save
      </button>
      <button class="btn btn-primary">Add to cart</button>
    </div>
  </div>
</div>