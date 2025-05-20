<script lang="ts">
	import '../app.css';
	import ToastContainer from '$lib/components/common/ToastContainer.svelte';
	
	let { children } = $props();
</script>

<ToastContainer />

{@render children()}