import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  classname?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastsService {
  private readonly toastListSignal = signal<Toast[]>([]);
  readonly toastList = this.toastListSignal.asReadonly();

  showToast(toast: Toast) {
    this.toastListSignal.update((list) => [...list, toast]);
    const duration = toast.duration ?? 1000;
    setTimeout(() => {
      this.toastListSignal.update((list) => list.filter((t) => t !== toast));
    }, duration);
  }

  removeToast(toast: Toast) {
    this.toastListSignal.update((list) => list.filter((t) => t !== toast));
  }

  clearToasts() {
    this.toastListSignal.set([]);
  }
}
