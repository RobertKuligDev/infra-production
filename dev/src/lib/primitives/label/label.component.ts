import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-label
 * Atomic visual element used to annotate UI components.
 * No logic, no interactivity — pure visual primitive.
 */
export type LabelVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './label.component.html',
  styleUrls: ['./label.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelComponent {
  private readonly _variant = signal<LabelVariant>('default');

  readonly variant = computed(() => this._variant());

  @Input()
  set variantInput(value: LabelVariant) {
    this._variant.set(value ?? 'default');
  }

  readonly classes = computed(() => ({
    'ds-label': true,
    [`ds-label--${this.variant()}`]: true,
  }));
}
