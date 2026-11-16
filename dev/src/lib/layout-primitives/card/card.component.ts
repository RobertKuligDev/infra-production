import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Card variants — constraint-based API.
 * Prevents arbitrary class names or styling.
 */
export type CardVariant =
  | 'default'
  | 'muted'
  | 'accent'
  | 'elevated'
  | 'feature'
  | 'product';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  private readonly _variant = signal<CardVariant>('default');
  private readonly _interactive = signal<boolean>(false);
  private readonly _blockPrefix = signal<string>('card');

  /**
   * Public API — constraint-based inputs.
   */
  @Input()
  set variant(value: CardVariant) {
    this._variant.set(value ?? 'default');
  }

  @Input()
  set interactive(value: boolean) {
    this._interactive.set(!!value);
  }

  @Input()
  set blockPrefix(value: string | null) {
    if (value && value.trim().length > 0) {
      this._blockPrefix.set(value.trim());
    }
  }

  /**
   * BEM class generation — SSR-safe and deterministic.
   */
  readonly classes = computed(() => {
    const base = this._blockPrefix();
    const variant = this._variant();
    const interactive = this._interactive();

    return {
      [base]: true,
      [`${base}--${variant}`]: true,
      [`${base}--interactive`]: interactive,
    };
  });
}
