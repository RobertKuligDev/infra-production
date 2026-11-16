import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../service/toast.service';
import { ToastComponent } from '../toast.component';

/**
 * ds-toast-container
 * Renders all active toasts from ToastService.
 */

@Component({
  selector: 'ds-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="ds-toast-container">
      <ds-toast
        *ngFor="let toast of service.toasts()"
        [id]="toast.id"
        [text]="toast.text"
        [variant]="toast.variant"
        (closed)="service.dismiss(toast.id)"
      />
    </div>
  `,
  styleUrls: ['../toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  readonly service = inject(ToastService);
}
