import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Icon Button UI component.
 * Provides icon-only interactive control with variants, sizes, and shapes.
 * Uses component-level tokens and integrates with layout primitives.
 */
export type IconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonShape = 'square' | 'circle';

@Component({
  selector: 'ds-icon-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-button.component.html',
  styleUrls: ['./icon-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  private readonly _variant = signal<IconButtonVariant>('ghost');
  private readonly _size = signal<IconButtonSize>('md');
  private readonly _shape = signal<IconButtonShape>('square');
  private readonly _disabled = signal<boolean>(false);

  readonly isDisabled = computed(() => this._disabled());

  @Input()
  set variant(value: IconButtonVariant) {
    this._variant.set(value ?? 'ghost');
  }

  @Input()
  set size(value: IconButtonSize) {
    this._size.set(value ?? 'md');
  }

  @Input()
  set shape(value: IconButtonShape) {
    this._shape.set(value ?? 'square');
  }

  @Input()
  set disabled(value: boolean) {
    this._disabled.set(!!value);
  }

  readonly classes = computed(() => {
    const base = 'ds-icon-btn';

    return {
      [base]: true,
      [`${base}--${this._variant()}`]: true,
      [`${base}--${this._size()}`]: true,
      [`${base}--${this._shape()}`]: true,
      [`${base}--disabled`]: this._disabled(),
    };
  });

  readonly ariaDisabled = computed(() => (this._disabled() ? 'true' : 'false'));
}
