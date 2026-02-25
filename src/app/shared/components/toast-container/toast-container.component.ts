import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast toast-top toast-end z-50">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="alert shadow-lg cursor-pointer max-w-sm"
          [class.alert-success]="toast.type === 'success'"
          [class.alert-error]="toast.type === 'error'"
          [class.alert-info]="toast.type === 'info'"
          [class.alert-warning]="toast.type === 'warning'"
          (click)="toastService.dismiss(toast.id)"
        >
          <span class="text-sm">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
}
