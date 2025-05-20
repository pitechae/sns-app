# Navigation Components

This directory contains navigation-related components for the SNS application.

## Components

### TopNavBar

A responsive navigation bar component that follows Tailwind CSS, DaisyUI, and SvelteKit best practices.

#### Features

- Responsive design that adapts to different screen sizes
- DiceBear avatar integration for user profiles
- Keyboard navigation support for accessibility
- Breadcrumb navigation with proper ARIA attributes
- Search functionality with keyboard shortcut (Ctrl+O)
- Dropdown menus for help and user profile

#### Usage

```svelte
<script>
  import TopNavBar from '$lib/components/navigation/TopNavBar.svelte';
  
  function handleMenuToggle() {
    // Handle menu toggle
  }
  
  function handleProfileClick() {
    // Handle profile click
  }
  
  function handleHelpClick() {
    // Handle help click
  }
</script>

<TopNavBar 
  username="John Doe"
  showSearch={true}
  showBreadcrumbs={true}
  on:menuToggle={handleMenuToggle}
  on:profileClick={handleProfileClick}
  on:helpClick={handleHelpClick}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `username` | string | 'User' | The username to display and use for avatar generation |
| `seed` | string | Same as username | Seed for DiceBear avatar generation |
| `showSearch` | boolean | true | Whether to show the search input |
| `showBreadcrumbs` | boolean | true | Whether to show breadcrumb navigation |

#### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `menuToggle` | none | Fired when the menu toggle button is clicked |
| `profileClick` | none | Fired when the profile avatar is clicked |
| `helpClick` | none | Fired when the help button is clicked |
| `search` | `{ query: string }` | Fired when the search input changes |

## Accessibility

The navigation components follow accessibility best practices:

- Proper ARIA attributes for interactive elements
- Keyboard navigation support
- Sufficient color contrast
- Text alternatives for images
- Focus management for keyboard users

## Styling

The components use Tailwind CSS utility classes and DaisyUI components for consistent styling:

- Responsive design with Tailwind's responsive modifiers
- DaisyUI's semantic component classes
- Focus states for keyboard navigation
- Hover states for interactive elements
- Consistent spacing and typography
