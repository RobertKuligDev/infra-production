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
 * ds-checkbox
 * Accessible checkbox with label, helper, error, variants,
 * indeterminate state, and full CVA integration.
 */
export type CheckboxVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent {
  private readonly _checked = signal<boolean>(false);
  private readonly _indeterminate = signal<boolean>(false);
  private readonly _label = signal<string | null>(null);
  private readonly _helper = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _variant = signal<CheckboxVariant>('default');
  private readonly _disabled = signal<boolean>(false);

  readonly checked = computed(() => this._checked());
  readonly indeterminate = computed(() => this._indeterminate());
  readonly label = computed(() => this._label());
  readonly helper = computed(() => this._helper());
  readonly error = computed(() => this._error());
  readonly variant = computed(() => this._variant());
  readonly disabled = computed(() => this._disabled());

  // Inputs
  @Input('label')
  set labelInput(value: string | null) {
    this._label.set(value);
  }

  @Input('helper')
  set helperInput(value: string | null) {
    this._helper.set(value);
  }

  @Input('error')
  set errorInput(value: string | null) {
    this._error.set(value);
  }

  @Input('variant')
  set variantInput(value: CheckboxVariant) {
    this._variant.set(value ?? 'default');
  }

  @Input('disabled')
  set disabledInput(value: boolean) {
    this._disabled.set(value);
  }

  @Input('indeterminate')
  set indeterminateInput(value: boolean) {
    this._indeterminate.set(value);
  }

  // CVA
  onChange = (value: boolean) => {};
  onTouched = () => {};

  writeValue(value: boolean): void {
    this._checked.set(value ?? false);
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

  toggle() {
    if (this.disabled()) return;

    const newValue = !this.checked();
    this._checked.set(newValue);
    this._indeterminate.set(false);
    this.onChange(newValue);
  }

  readonly classes = computed(() => ({
    'ds-checkbox': true,
    [`ds-checkbox--${this.variant()}`]: true,
    'ds-checkbox--error': !!this.error(),
    'ds-checkbox--disabled': this.disabled(),
    'ds-checkbox--indeterminate': this.indeterminate(),
  }));
}
