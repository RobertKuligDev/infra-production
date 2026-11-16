import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-counter
 * Atomic visual primitive for numeric indicators (counts, badges, notifications).
 * No logic, no interactivity — pure visual element.
 */
export type CounterVariant = 'default' | 'contrast' | 'accent' | 'danger';

@Component({
  selector: 'ds-counter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CounterComponent {
  private readonly _variant = signal<CounterVariant>('default');

  readonly variant = computed(() => this._variant());

  @Input('variant')
  set variantInput(value: CounterVariant) {
    this._variant.set(value ?? 'default');
  }

  readonly classes = computed(() => ({
    'ds-counter': true,
    [`ds-counter--${this.variant()}`]: true,
  }));
}
