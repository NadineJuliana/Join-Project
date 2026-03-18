import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  classname?: string;
  duration?: number;
  icon?: string;
  position?: 'bottom' | 'center';
}

/**
 * @category UI
 * @description Service for showing, removing, and clearing toast notifications.
 */
  @Injectable({
    providedIn: 'root',
  })
  export class ToastsService {
    /** Signal holding the list of active toasts */
      private readonly toastListSignal = signal<Toast[]>([]);

    /** Readonly list of toasts */
      readonly toastList = this.toastListSignal.asReadonly();

    /** Show a toast notification */
      showToast(toast: Toast) {
        this.toastListSignal.update((list) => [...list, toast]);
        const duration = toast.duration ?? 1000;
        setTimeout(() => {
          this.toastListSignal.update((list) => list.filter((t) => t !== toast));
        }, duration);
      }

    /** Remove a specific toast */
      removeToast(toast: Toast) {
        this.toastListSignal.update((list) => list.filter((t) => t !== toast));
      }

    /** Clear all toasts */
      clearToasts() {
        this.toastListSignal.set([]);
      }
  }
