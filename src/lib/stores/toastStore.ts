import { writable } from 'svelte/store';

// Define toast notification type
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Define toast notification interface
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Create a writable store for toast notifications
const toastStore = writable<Toast[]>([]);

// Helper function to generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Function to add a toast notification
export function addToast(
  message: string,
  type: ToastType = 'info',
  duration: number = 3000,
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right'
): string {
  const id = generateId();
  
  // Add toast to the store
  toastStore.update(toasts => [
    ...toasts,
    { id, message, type, duration, position }
  ]);
  
  // Automatically remove toast after duration
  setTimeout(() => {
    removeToast(id);
  }, duration);
  
  return id;
}

// Function to remove a toast notification
export function removeToast(id: string): void {
  toastStore.update(toasts => toasts.filter(toast => toast.id !== id));
}

// Convenience functions for different toast types
export function successToast(message: string, duration?: number): string {
  return addToast(message, 'success', duration);
}

export function errorToast(message: string, duration?: number): string {
  return addToast(message, 'error', duration);
}

export function warningToast(message: string, duration?: number): string {
  return addToast(message, 'warning', duration);
}

export function infoToast(message: string, duration?: number): string {
  return addToast(message, 'info', duration);
}

export default toastStore;
