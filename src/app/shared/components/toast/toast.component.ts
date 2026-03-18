import { Component, inject } from '@angular/core';
import { ToastsService } from '../../../core/services/toasts.service';

/**
 * @category UI
 * @description Component to display toast notifications from ToastsService.
 */
  @Component({
    selector: 'app-toast',
    imports: [],
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.scss',
  })
  export class ToastComponent {
    /** Injected ToastsService for accessing toasts */
      toastService = inject(ToastsService);

    /** Get the current list of toasts */
      get toastList() {
        return this.toastService.toastList();
      }

    /** Check if any toast has center position */
      get isCenterPosition(): boolean {
        return this.toastList.some((t) => t.position === 'center');
      }
  }
