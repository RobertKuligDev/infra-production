import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-status-dot
 * Minimal visual primitive for status indication.
 * Typically used next to labels, avatars, or items.
 */
export type StatusDotVariant = 'success' | 'warning' | 'danger' | 'muted';

@Component({
  selector: 'ds-status-dot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-dot.component.html',
  styleUrls: ['./status-dot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusDotComponent {
  private readonly _variant = signal<StatusDotVariant>('muted');

  readonly variant = computed(() => this._variant());

  @Input('variant')
  set variantInput(value: StatusDotVariant) {
    this._variant.set(value ?? 'muted');
  }

  readonly classes = computed(() => ({
    'ds-status-dot': true,
    [`ds-status-dot--${this.variant()}`]: true,
  }));
}
