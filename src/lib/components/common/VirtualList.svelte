<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  
  // Props
  export let items: any[] = [];
  export let height = 400;
  export let itemHeight = 40;
  export let buffer = 5; // Number of items to render above/below the visible area
  export let onEndReached: (() => void) | null = null;
  export let endReachedThreshold = 0.8; // Percentage of the list that must be scrolled to trigger onEndReached
  
  // Internal state
  let containerElement: HTMLDivElement;
  let scrollTop = 0;
  let visibleItems: any[] = [];
  let startIndex = 0;
  let endIndex = 0;
  let paddingTop = 0;
  let paddingBottom = 0;
  let totalHeight = 0;
  
  const dispatch = createEventDispatcher<{
    scroll: { scrollTop: number; scrollHeight: number; clientHeight: number };
  }>();
  
  // Calculate which items should be visible
  function calculateVisibleItems() {
    if (!containerElement || items.length === 0) return;
    
    totalHeight = items.length * itemHeight;
    
    // Calculate the range of visible items
    startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + height) / itemHeight) + buffer
    );
    
    // Update the visible items
    visibleItems = items.slice(startIndex, endIndex + 1);
    
    // Calculate padding to maintain scroll position
    paddingTop = startIndex * itemHeight;
    paddingBottom = totalHeight - (endIndex + 1) * itemHeight;
    
    // Check if we need to load more items
    if (onEndReached && 
        scrollTop + height >= totalHeight * endReachedThreshold && 
        endIndex === items.length - 1) {
      onEndReached();
    }
  }
  
  // Handle scroll events
  function handleScroll(event: Event) {
    const target = event.target as HTMLDivElement;
    scrollTop = target.scrollTop;
    
    dispatch('scroll', {
      scrollTop,
      scrollHeight: target.scrollHeight,
      clientHeight: target.clientHeight
    });
    
    calculateVisibleItems();
  }
  
  // Update visible items when props change
  $: if (items) {
    calculateVisibleItems();
  }
  
  // Initialize component
  onMount(() => {
    calculateVisibleItems();
  });
</script>

<div 
  bind:this={containerElement}
  on:scroll={handleScroll}
  class="virtual-list overflow-auto"
  style="height: {height}px;"
>
  <div style="height: {totalHeight}px; position: relative;">
    <div style="position: absolute; top: {paddingTop}px; width: 100%;">
      {#each visibleItems as item, i (startIndex + i)}
        <div style="height: {itemHeight}px;">
          <slot {item} index={startIndex + i} />
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .virtual-list {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
</style>
