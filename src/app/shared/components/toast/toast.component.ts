import { Component, inject } from '@angular/core';
import { ToastsService } from '../../../core/services/toasts.service';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
})
export class ToastComponent {
  toastService = inject(ToastsService);

  get toastList() {
    return this.toastService.toastList();
  }

  get isCenterPosition(): boolean {
    return this.toastList.some((t) => t.position === 'center');
  }
}
