import type { Action } from 'svelte/action';

/**
 * Svelte action that dispatches a custom "clickoutside" event when a click occurs outside the node it's applied to.
 * 
 * Usage:
 * ```svelte
 * <div use:clickOutside on:clickoutside={handleClickOutside}>
 *   <!-- content -->
 * </div>
 * ```
 */
export const clickOutside: Action<HTMLElement, undefined> = (node) => {
  const handleClick = (event: MouseEvent) => {
    if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
      node.dispatchEvent(new CustomEvent('clickoutside'));
    }
  };

  document.addEventListener('click', handleClick, true);
  
  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
};
