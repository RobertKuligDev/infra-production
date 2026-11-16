import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
  signal,
  computed,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * ds-rating
 * Star rating control with hover preview, keyboard control,
 * label, helper, error, variants, and full CVA integration.
 */
export type RatingVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true,
    },
  ],
})
export class RatingComponent {
  private readonly _value = signal<number>(0);
  private readonly _hover = signal<number | null>(null);
  private readonly _max = signal<number>(5);

  private readonly _label = signal<string | null>(null);
  private readonly _helper = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _variant = signal<RatingVariant>('default');
  private readonly _disabled = signal<boolean>(false);

  readonly value = computed(() => this._value());
  readonly hover = computed(() => this._hover());
  readonly max = computed(() => this._max());

  readonly label = computed(() => this._label());
  readonly helper = computed(() => this._helper());
  readonly error = computed(() => this._error());
  readonly variant = computed(() => this._variant());
  readonly disabled = computed(() => this._disabled());

  // Inputs
  @Input('label') set labelInput(v: string | null) {
    this._label.set(v);
  }
  @Input('helper') set helperInput(v: string | null) {
    this._helper.set(v);
  }
  @Input('error') set errorInput(v: string | null) {
    this._error.set(v);
  }
  @Input('variant') set variantInput(v: RatingVariant) {
    this._variant.set(v ?? 'default');
  }
  @Input('disabled') set disabledInput(v: boolean) {
    this._disabled.set(v);
  }
  @Input('max') set maxInput(v: number) {
    this._max.set(v ?? 5);
  }

  // CVA
  onChange = (value: number) => {};
  onTouched = () => {};

  writeValue(value: number): void {
    this._value.set(value ?? 0);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  // Hover preview
  setHover(v: number | null) {
    if (this.disabled()) return;
    this._hover.set(v);
  }

  // Select rating
  select(v: number) {
    if (this.disabled()) return;
    this._value.set(v);
    this.onChange(v);
  }

  // Keyboard
  onKey(event: KeyboardEvent) {
    if (this.disabled()) return;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        this.select(Math.max(0, this.value() - 1));
        break;

      case 'ArrowRight':
      case 'ArrowUp':
        this.select(Math.min(this.max(), this.value() + 1));
        break;

      case 'Home':
        this.select(0);
        break;

      case 'End':
        this.select(this.max());
        break;
    }
  }

  readonly classes = computed(() => ({
    'ds-rating': true,
    [`ds-rating--${this.variant()}`]: true,
    'ds-rating--error': !!this.error(),
    'ds-rating--disabled': this.disabled(),
  }));
}
