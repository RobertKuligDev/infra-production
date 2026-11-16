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
 * ds-radio
 * Single radio button with label, helper, error, variants,
 * and full CVA integration. Works inside any radiogroup.
 */
export type RadioVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-radio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true,
    },
  ],
})
export class RadioComponent {
  private readonly _value = signal<string | null>(null);
  private readonly _model = signal<string | null>(null);
  private readonly _label = signal<string | null>(null);
  private readonly _helper = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _variant = signal<RadioVariant>('default');
  private readonly _disabled = signal<boolean>(false);

  readonly value = computed(() => this._value());
  readonly model = computed(() => this._model());
  readonly label = computed(() => this._label());
  readonly helper = computed(() => this._helper());
  readonly error = computed(() => this._error());
  readonly variant = computed(() => this._variant());
  readonly disabled = computed(() => this._disabled());

  readonly checked = computed(() => this.model() === this.value());

  // Inputs
  @Input('value')
  set valueInput(v: string | null) {
    this._value.set(v);
  }

  @Input('label')
  set labelInput(v: string | null) {
    this._label.set(v);
  }

  @Input('helper')
  set helperInput(v: string | null) {
    this._helper.set(v);
  }

  @Input('error')
  set errorInput(v: string | null) {
    this._error.set(v);
  }

  @Input('variant')
  set variantInput(v: RadioVariant) {
    this._variant.set(v ?? 'default');
  }

  @Input('disabled')
  set disabledInput(v: boolean) {
    this._disabled.set(v);
  }

  // CVA
  onChange = (value: string | null) => {};
  onTouched = () => {};

  writeValue(value: string | null): void {
    this._model.set(value);
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

  select() {
    if (this.disabled()) return;
    this._model.set(this.value());
    this.onChange(this.value());
  }

  readonly classes = computed(() => ({
    'ds-radio': true,
    [`ds-radio--${this.variant()}`]: true,
    'ds-radio--checked': this.checked(),
    'ds-radio--error': !!this.error(),
    'ds-radio--disabled': this.disabled(),
  }));
}
