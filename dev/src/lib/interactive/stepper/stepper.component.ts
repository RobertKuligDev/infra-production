import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * ds-stepper
 * Numeric stepper with increment/decrement buttons,
 * full CVA integration, ARIA spinbutton, variants,
 * and Signals-based state.
 */
export type StepperVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StepperComponent),
      multi: true,
    },
  ],
})
export class StepperComponent {
  private readonly _value = signal<number>(0);
  private readonly _label = signal<string | null>(null);
  private readonly _helper = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _variant = signal<StepperVariant>('default');
  private readonly _disabled = signal<boolean>(false);

  private readonly _min = signal<number | null>(null);
  private readonly _max = signal<number | null>(null);
  private readonly _step = signal<number>(1);

  readonly value = computed(() => this._value());
  readonly label = computed(() => this._label());
  readonly helper = computed(() => this._helper());
  readonly error = computed(() => this._error());
  readonly variant = computed(() => this._variant());
  readonly disabled = computed(() => this._disabled());

  readonly min = computed(() => this._min());
  readonly max = computed(() => this._max());
  readonly step = computed(() => this._step());

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
  @Input('variant') set variantInput(v: StepperVariant) {
    this._variant.set(v ?? 'default');
  }
  @Input('disabled') set disabledInput(v: boolean) {
    this._disabled.set(v);
  }

  @Input('min') set minInput(v: number | null) {
    this._min.set(v);
  }
  @Input('max') set maxInput(v: number | null) {
    this._max.set(v);
  }
  @Input('step') set stepInput(v: number) {
    this._step.set(v ?? 1);
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

  // Logic
  private clamp(v: number): number {
    const min = this.min();
    const max = this.max();
    if (min !== null && v < min) return min;
    if (max !== null && v > max) return max;
    return v;
  }

  increment() {
    if (this.disabled()) return;
    const newValue = this.clamp(this.value() + this.step());
    this._value.set(newValue);
    this.onChange(newValue);
  }

  decrement() {
    if (this.disabled()) return;
    const newValue = this.clamp(this.value() - this.step());
    this._value.set(newValue);
    this.onChange(newValue);
  }

  onInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    const parsed = Number(raw);
    if (!isNaN(parsed)) {
      const newValue = this.clamp(parsed);
      this._value.set(newValue);
      this.onChange(newValue);
    }
  }

  onKey(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.increment();
        break;
      case 'ArrowDown':
        this.decrement();
        break;
      case 'PageUp':
        this.increment();
        break;
      case 'PageDown':
        this.decrement();
        break;
      case 'Home':
        if (this.min() !== null) this.writeValue(this.min()!);
        break;
      case 'End':
        if (this.max() !== null) this.writeValue(this.max()!);
        break;
    }
  }

  readonly classes = computed(() => ({
    'ds-stepper': true,
    [`ds-stepper--${this.variant()}`]: true,
    'ds-stepper--error': !!this.error(),
    'ds-stepper--disabled': this.disabled(),
  }));
}
