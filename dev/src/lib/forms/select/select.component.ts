/**
 * Select UI Control.
 * Provides a custom dropdown with keyboard navigation, ARIA roles,
 * variant styling, and full CVA integration.
 */

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  HostListener,
  forwardRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export type SelectVariant = 'default' | 'subtle' | 'contrast';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'ds-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent {
  private readonly _options = signal<SelectOption[]>([]);
  private readonly _value = signal<string | null>(null);
  private readonly _open = signal<boolean>(false);
  private readonly _label = signal<string | null>(null);
  private readonly _placeholder = signal<string | null>(null);
  private readonly _helper = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _variant = signal<SelectVariant>('default');
  private readonly _disabled = signal<boolean>(false);

  readonly options = computed(() => this._options());
  readonly value = computed(() => this._value());
  readonly open = computed(() => this._open());
  readonly label = computed(() => this._label());
  readonly placeholder = computed(() => this._placeholder());
  readonly helper = computed(() => this._helper());
  readonly error = computed(() => this._error());
  readonly variant = computed(() => this._variant());
  readonly disabled = computed(() => this._disabled());

  readonly selectedLabel = computed(() => {
    const v = this._value();
    return this._options().find((o) => o.value === v)?.label ?? null;
  });

  @Input()
  set optionsInput(value: SelectOption[]) {
    this._options.set(value ?? []);
  }

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
  set variantInput(value: SelectVariant) {
    this._variant.set(value ?? 'default');
  }

  @Input()
  set disabledInput(value: boolean) {
    this._disabled.set(value);
  }

  // CVA
  onChange = (value: string | null) => {};
  onTouched = () => {};

  writeValue(value: string | null): void {
    this._value.set(value);
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
    this._open.set(!this._open());
  }

  select(value: string) {
    this._value.set(value);
    this.onChange(value);
    this._open.set(false);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this._open.set(false);
    }
  }

  readonly classes = computed(() => {
    const base = 'ds-select';

    return {
      [base]: true,
      [`${base}--${this.variant()}`]: true,
      [`${base}--open`]: this.open(),
      [`${base}--error`]: !!this.error(),
      [`${base}--disabled`]: this.disabled(),
    };
  });
}
