<script lang="ts">
  import { page } from '$app/stores';
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  
  // Define navigation item types
  type NavigationChild = {
    title: string;
    href: string;
    icon?: string;
  };
  
  type NavigationGrandchild = {
    title: string;
    href: string;
  };
  
  type NavigationSubItem = NavigationChild & {
    children?: NavigationGrandchild[];
  };
  
  type NavigationItem = {
    title: string;
    href: string;
    icon: string;
    children?: (NavigationSubItem | NavigationChild)[];
  };
  
  // Props
  export let isOpen = false;
  
  // Navigation items structure
  export let navigationItems: NavigationItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'home'
    },
    {
      title: 'POS',
      href: '/pos',
      icon: 'pos'
    },
    {
      title: 'Stock',
      href: '/stock',
      icon: 'box'
    },
    {
      title: 'Report',
      href: '/reports',
      icon: 'chart'
    },
    {
      title: 'Setting',
      href: '/settings',
      icon: 'settings'
    }
  ];
  
  // State
  let expandedSections = new Set();
  let expandedSubSections = new Set();
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    navigate: { href: string };
    close: void;
  }>();
  
  // Toggle section expansion
  function toggleSection(sectionTitle: string) {
    if (expandedSections.has(sectionTitle)) {
      expandedSections.delete(sectionTitle);
    } else {
      expandedSections.add(sectionTitle);
    }
    expandedSections = expandedSections; // Trigger reactivity
  }
  
  // Toggle subsection expansion
  function toggleSubSection(parentTitle: string, subSectionTitle: string) {
    const key = `${parentTitle}:${subSectionTitle}`;
    if (expandedSubSections.has(key)) {
      expandedSubSections.delete(key);
    } else {
      expandedSubSections.add(key);
    }
    expandedSubSections = expandedSubSections; // Trigger reactivity
  }
  
  // Handle navigation
  const handleNavigate = (href: string) => {
    dispatch('navigate', { href });
  };
  
  // Close sidebar (mobile)
  const closeSidebar = () => {
    dispatch('close');
  };
  
  // Check if path is active
  function isActive(href: string): boolean {
    if (href === '/') {
      return $page.url.pathname === '/';
    }
    return $page.url.pathname.startsWith(href);
  }
  
  // Get icon SVG based on icon name
  function getIconSvg(iconName: string): string {
    switch (iconName) {
      case 'home':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />`;  
      case 'pos':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />`;  
      case 'box':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />`;  
      case 'chart':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />`;  
      case 'inventory':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />`;  
      case 'business':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />`;  
      case 'settings':
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />`;  
      default:
        return `<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />`;  
    }
  }
</script>

<aside 
  class="h-full flex flex-col bg-base-200 text-base-content overflow-hidden transition-all duration-300 ease-in-out"
  class:w-64={isOpen}
  class:w-0={!isOpen}
  aria-hidden={!isOpen}
>
  <div class="p-4 flex-1 overflow-y-auto">
    <nav aria-label="Main Navigation">
      <ul class="space-y-1">
        {#each navigationItems as item}
          <li>
            {#if item.children}
              <!-- Section with children -->
              <div class="flex flex-col">
                <button 
                  class="flex items-center justify-between w-full px-3 py-2 text-left rounded-lg hover:bg-base-300 transition-colors {isActive(item.href) ? 'bg-primary/10 text-primary font-medium' : ''}"
                  onclick={() => toggleSection(item.title)}
                  aria-expanded={expandedSections.has(item.title)}
                  aria-controls={`section-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div class="flex items-center">
                    <span class="inline-flex items-center justify-center w-5 h-5 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5" aria-hidden="true">
                        {@html getIconSvg(item.icon)}
                      </svg>
                    </span>
                    <span>{item.title}</span>
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke-width="1.5" 
                    stroke="currentColor" 
                    class="w-4 h-4 transition-transform {expandedSections.has(item.title) ? 'rotate-180' : ''}"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                
                {#if expandedSections.has(item.title)}
                  <ul 
                    id={`section-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    class="pl-10 mt-1 space-y-1"
                    transition:slide={{ duration: 200 }}
                  >
                    {#each item.children as child}
                      <li>
                        {#if 'children' in child && child.children}
                          <!-- Nested subsection -->
                          <div class="flex flex-col">
                            <button 
                              class="flex items-center justify-between w-full px-3 py-2 text-left rounded-lg hover:bg-base-300 transition-colors {isActive(child.href) ? 'text-primary font-medium' : ''}"
                              onclick={() => toggleSubSection(item.title, child.title)}
                              aria-expanded={expandedSubSections.has(`${item.title}:${child.title}`)}
                              aria-controls={`subsection-${item.title.toLowerCase().replace(/\s+/g, '-')}-${child.title.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <div class="flex items-center">
                                {#if child.icon}
                                  <span class="inline-flex items-center justify-center w-5 h-5 mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5" aria-hidden="true">
                                      {@html getIconSvg(child.icon)}
                                    </svg>
                                  </span>
                                {/if}
                                <span>{child.title}</span>
                              </div>
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke-width="1.5" 
                                stroke="currentColor" 
                                class="w-4 h-4 transition-transform {expandedSubSections.has(`${item.title}:${child.title}`) ? 'rotate-180' : ''}"
                                aria-hidden="true"
                              >
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                            
                            {#if expandedSubSections.has(`${item.title}:${child.title}`) && 'children' in child && child.children}
                              <ul 
                                id={`subsection-${item.title.toLowerCase().replace(/\s+/g, '-')}-${child.title.toLowerCase().replace(/\s+/g, '-')}`}
                                class="pl-8 mt-1 space-y-1"
                                transition:slide={{ duration: 200 }}
                              >
                                {#each child.children as grandchild}
                                  <li>
                                    <a 
                                      href={grandchild.href}
                                      class="block px-3 py-2 rounded-lg hover:bg-base-300 transition-colors {$page.url.pathname === grandchild.href ? 'text-primary font-medium' : ''}"
                                      onclick={(e) => { e.preventDefault(); handleNavigate(grandchild.href); }}
                                      aria-current={$page.url.pathname === grandchild.href ? 'page' : undefined}
                                    >
                                      {grandchild.title}
                                    </a>
                                  </li>
                                {/each}
                              </ul>
                            {/if}
                          </div>
                        {:else}
                          <!-- Regular child item -->
                          <a 
                            href={child.href}
                            class="flex items-center px-3 py-2 rounded-lg hover:bg-base-300 transition-colors {$page.url.pathname === child.href ? 'text-primary font-medium' : ''}"
                            onclick={(e) => { e.preventDefault(); handleNavigate(child.href); }}
                            aria-current={$page.url.pathname === child.href ? 'page' : undefined}
                          >
                            {#if child.icon}
                              <span class="inline-flex items-center justify-center w-5 h-5 mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5" aria-hidden="true">
                                  {@html getIconSvg(child.icon)}
                                </svg>
                              </span>
                            {/if}
                            <span>{child.title}</span>
                          </a>
                        {/if}
                      </li>
                    {/each}
                  </ul>
                {/if}
              </div>
            {:else}
              <!-- Single item -->
              <a 
                href={item.href}
                class="flex items-center px-3 py-2 rounded-lg hover:bg-base-300 transition-colors {isActive(item.href) ? 'bg-primary/10 text-primary font-medium' : ''}"
                onclick={(e) => { e.preventDefault(); handleNavigate(item.href); }}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <span class="inline-flex items-center justify-center w-5 h-5 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5" aria-hidden="true">
                    {@html getIconSvg(item.icon)}
                  </svg>
                </span>
                <span>{item.title}</span>
              </a>
            {/if}
          </li>
        {/each}
      </ul>
    </nav>
  </div>
  
  <!-- Mobile close button -->
  <div class="p-4 border-t border-base-300 lg:hidden">
    <button
      class="btn btn-sm btn-ghost w-full flex items-center justify-center"
      onclick={closeSidebar}
      aria-label="Close sidebar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      Close Menu
    </button>
  </div>
</aside>
