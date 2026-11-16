import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-chip
 * Visual primitive used for tags, filters, and selections.
 * No business logic — pure visual atom with variant styling.
 */
export type ChipVariant =
  | 'default'
  | 'subtle'
  | 'contrast'
  | 'success'
  | 'warning'
  | 'danger';

@Component({
  selector: 'ds-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  private readonly _variant = signal<ChipVariant>('default');

  readonly variant = computed(() => this._variant());

  @Input('variant')
  set variantInput(value: ChipVariant) {
    this._variant.set(value ?? 'default');
  }

  readonly classes = computed(() => ({
    'ds-chip': true,
    [`ds-chip--${this.variant()}`]: true,
  }));
}
