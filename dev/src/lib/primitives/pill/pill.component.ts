import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-pill
 * Visual primitive for category/label emphasis.
 * Slightly more prominent than badge, still non-interactive.
 */
export type PillVariant = 'default' | 'accent' | 'muted';

@Component({
  selector: 'ds-pill',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pill.component.html',
  styleUrls: ['./pill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PillComponent {
  private readonly _variant = signal<PillVariant>('default');

  readonly variant = computed(() => this._variant());

  @Input('variant')
  set variantInput(value: PillVariant) {
    this._variant.set(value ?? 'default');
  }

  readonly classes = computed(() => ({
    'ds-pill': true,
    [`ds-pill--${this.variant()}`]: true,
  }));
}
