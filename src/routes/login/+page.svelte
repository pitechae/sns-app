<script lang="ts">
  let username = '';
  let password = '';
  let rememberMe = false;
  let isLoading = false;
  let error = '';
  let showPassword = false;
  
  function togglePassword() {
    showPassword = !showPassword;
  }
  
  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!username || !password) {
      error = 'Please enter both username and password';
      return;
    }
    
    try {
      isLoading = true;
      error = '';
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.href = '/';
    } catch (err) {
      error = 'Invalid username or password';
    } finally {
      isLoading = false;
    }
  }
  
  function useDemoAccount() {
    username = 'demo_user';
    password = 'password123';
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-base-200">
  <div class="card w-full max-w-sm bg-base-100 shadow-xl">
    <div class="card-body p-6">
      <h1 class="card-title text-4xl font-bold mb-6">Login</h1>
      
      {#if error}
        <div class="alert alert-error shadow-lg mb-4 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      {/if}
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-control">
          <label class="label" for="username">
            <span class="label-text font-medium">Username</span>
          </label>
          <input 
            id="username"
            type="text" 
            placeholder="Enter your username" 
            class="input input-bordered w-full focus:input-primary"
            bind:value={username}
            disabled={isLoading}
            required
          />
        </div>
        
        <div class="form-control mt-4">
          <label class="label" for="password">
            <span class="label-text font-medium">Password</span>
          </label>
          <div class="relative">
            <input 
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password" 
              class="input input-bordered w-full focus:input-primary"
              bind:value={password}
              disabled={isLoading}
              required
            />
            <button 
              type="button" 
              class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
              on:click={togglePassword}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {#if showPassword}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
        </div>
        
        <div class="flex justify-between items-center mt-2">
          <label class="label cursor-pointer inline-flex gap-2">
            <input 
              type="checkbox" 
              class="checkbox checkbox-sm checkbox-primary" 
              bind:checked={rememberMe}
              disabled={isLoading}
            />
            <span class="label-text">Remember me</span>
          </label>
          <a href="/forgot-password" class="text-xs link link-hover text-primary">
            Forgot password?</a>
        </div>
        
        <div class="form-control mt-6">
          <button 
            type="submit" 
            class="btn btn-primary w-full {isLoading ? 'loading' : ''}"
            disabled={isLoading}
          >
            {#if !isLoading}Sign In{/if}
          </button>
        </div>
      </form>
      
      <div class="divider text-xs text-base-content/50 my-4">OR</div>
      
      <button 
        type="button" 
        class="btn btn-outline btn-sm w-full"
        on:click={useDemoAccount}
        disabled={isLoading}
      >
        Try Demo Account
      </button>
      
      <div class="text-center text-sm mt-6">
        <span class="text-base-content/70">Don't have an account?</span>
        <a href="/register" class="link link-primary ml-1">Sign up</a>
      </div>
    </div>
  </div>
</div>
