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
 * Input UI Control.
 * Provides labeled text input with error, helper text, and variant styling.
 * Implements ControlValueAccessor for Angular forms.
 */
export type InputVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent {
  private readonly _value = signal<string>('');
  private readonly _label = signal<string | null>(null);
  private readonly _placeholder = signal<string | null>(null);
  private readonly _helper = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _variant = signal<InputVariant>('default');
  private readonly _disabled = signal<boolean>(false);

  readonly value = computed(() => this._value());
  readonly label = computed(() => this._label());
  readonly placeholder = computed(() => this._placeholder());
  readonly helper = computed(() => this._helper());
  readonly error = computed(() => this._error());
  readonly variant = computed(() => this._variant());
  readonly disabled = computed(() => this._disabled());

  @Input()
  set labelInput(value: string | null) {
    this._label.set(value);
  }

  @Input()
  set placeholderInput(value: string | null) {
    this._placeholder.set(value);
  }

  @Input()
  set helperInput(value: string | null) {
    this._helper.set(value);
  }

  @Input()
  set errorInput(value: string | null) {
    this._error.set(value);
  }

  @Input()
  set variantInput(value: InputVariant) {
    this._variant.set(value ?? 'default');
  }

  @Input()
  set disabledInput(value: boolean) {
    this._disabled.set(value);
  }

  // CVA
  onChange = (value: string) => {};
  onTouched = () => {};

  writeValue(value: string): void {
    this._value.set(value ?? '');
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

  updateValue(event: Event) {
    const target = event.target as HTMLInputElement;
    this._value.set(target.value);
    this.onChange(target.value);
  }

  readonly classes = computed(() => {
    const base = 'ds-input';

    return {
      [base]: true,
      [`${base}--${this.variant()}`]: true,
      [`${base}--error`]: !!this.error(),
      [`${base}--disabled`]: this.disabled(),
    };
  });
}
