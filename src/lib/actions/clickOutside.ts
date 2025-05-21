import type { Action } from 'svelte/action';

/**
 * Svelte action that either dispatches a custom "clickoutside" event or calls a callback function
 * when a click occurs outside the node it's applied to.
 * 
 * Usage with event:
 * ```svelte
 * <div use:clickOutside on:clickoutside={handleClickOutside}>
 *   <!-- content -->
 * </div>
 * ```
 * 
 * Usage with callback:
 * ```svelte
 * <div use:clickOutside={() => isOpen = false}>
 *   <!-- content -->
 * </div>
 * ```
 */
export const clickOutside: Action<HTMLElement, (() => void) | undefined> = (node, callback) => {
  const handleClick = (event: MouseEvent) => {
    if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
      if (callback) {
        callback();
      } else {
        node.dispatchEvent(new CustomEvent('clickoutside'));
      }
    }
  };

  document.addEventListener('click', handleClick, true);
  
  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
};
