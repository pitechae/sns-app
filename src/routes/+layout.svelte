<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import ToastContainer from '$lib/components/common/ToastContainer.svelte';
	import TopNavBar from '$lib/components/navigation/TopNavBar.svelte';
	import SideNavigation from '$lib/components/navigation/SideNavigation.svelte';
	
	let { children } = $props();
	let sidebarOpen = $state(false);
	let mounted = $state(false);
	
	// Handle menu toggle
	function handleMenuToggle() {
		sidebarOpen = !sidebarOpen;
	}
	
	// Handle profile click
	function handleProfileClick() {
		console.log('Profile clicked');
	}
	
	// Handle help click
	function handleHelpClick() {
		console.log('Help clicked');
	}
	
	// Handle search
	function handleSearch(event: CustomEvent<{query: string}>) {
		console.log('Search query:', event.detail.query);
		// Add search logic here
	}
</script>

<div class="flex flex-col min-h-screen bg-base-100">
	<TopNavBar 
		username="Admin"
		on:menuToggle={handleMenuToggle}
		on:profileClick={handleProfileClick}
		on:helpClick={handleHelpClick}
		on:search={handleSearch}
	/>
	
	<div class="flex flex-1 overflow-hidden">
		<!-- Sidebar - hidden on mobile by default -->
		<div 
			class="fixed lg:static inset-y-0 left-0 z-30 transform lg:transform-none lg:translate-x-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
		>
			<SideNavigation 
				isOpen={true} 
				on:navigate={(e: CustomEvent<{href: string}>) => {
					window.location.href = e.detail.href;
					sidebarOpen = false;
				}}
				on:close={() => sidebarOpen = false}
			/>
		</div>
		
		<!-- Overlay for mobile sidebar -->
		{#if sidebarOpen}
			<div 
				class="fixed inset-0 bg-black/50 z-20 lg:hidden" 
				onclick={() => sidebarOpen = false}
				onkeydown={(e) => e.key === 'Escape' && (sidebarOpen = false)}
				tabindex="-1"
				role="button"
				aria-label="Close sidebar"
			></div>
		{/if}
		
		<!-- Main content -->
		<main class="flex-1 overflow-auto p-4 lg:p-6">
			{@render children()}
		</main>
	</div>
	
	<ToastContainer />
</div>