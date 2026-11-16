import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-toast
 * Single toast message with variant styling and close button.
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'ds-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private readonly _text = signal('');
  private readonly _variant = signal<ToastVariant>('info');

  readonly text = computed(() => this._text());
  readonly variant = computed(() => this._variant());

  @Input() id!: string;

  @Input('text')
  set textInput(value: string) {
    this._text.set(value);
  }

  @Input('variant')
  set variantInput(value: ToastVariant) {
    this._variant.set(value ?? 'info');
  }

  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }

  readonly classes = computed(() => ({
    'ds-toast': true,
    [`ds-toast--${this.variant()}`]: true,
  }));
}
