import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Button UI component.
 * Provides semantic actions, variants, sizes, and interactive states.
 * Uses component-level tokens and integrates with layout primitives.
 */
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'link';

/**
 * Button sizes.
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  private readonly _variant = signal<ButtonVariant>('primary');
  private readonly _size = signal<ButtonSize>('md');
  private readonly _loading = signal<boolean>(false);
  private readonly _disabled = signal<boolean>(false);

  // ✔ Public computed — renamed to avoid conflicts
  readonly isLoading = computed(() => this._loading());
  readonly isDisabled = computed(() => this._disabled());

  /**
   * Public API — constraint-based inputs.
   */
  @Input()
  set variant(value: ButtonVariant) {
    this._variant.set(value ?? 'primary');
  }

  @Input()
  set size(value: ButtonSize) {
    this._size.set(value ?? 'md');
  }

  @Input()
  set loading(value: boolean) {
    this._loading.set(!!value);
  }

  @Input()
  set disabled(value: boolean) {
    this._disabled.set(!!value);
  }

  /**
   * Computed classes (BEM).
   */
  readonly classes = computed(() => {
    const base = 'ds-btn';

    return {
      [base]: true,
      [`${base}--${this._variant()}`]: true,
      [`${base}--${this._size()}`]: true,
      [`${base}--loading`]: this._loading(),
      [`${base}--disabled`]: this._disabled(),
    };
  });

  /**
   * ARIA attributes.
   */
  readonly ariaDisabled = computed(() =>
    this._disabled() || this._loading() ? 'true' : 'false',
  );
}
