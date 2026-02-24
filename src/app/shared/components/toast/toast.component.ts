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

  //  constructor() {
  //   this.toastService.showToast({
  //     message: 'Contact successfully created',
  //     classname: 'toast__success',
  //     duration: 999999
  //   });
}
