import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
  signal,
  computed,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * ds-textarea
 * Multi-line text input with label, helper, error, variants,
 * optional auto-resize, and full CVA integration.
 */
export type TextareaVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-textarea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements AfterViewInit {
  private readonly _value = signal<string>('');
  private readonly _label = signal<string | null>(null);
  private readonly _placeholder = signal<string | null>(null);
  private readonly _helper = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _variant = signal<TextareaVariant>('default');
  private readonly _disabled = signal<boolean>(false);
  private readonly _autoResize = signal<boolean>(false);

  readonly value = computed(() => this._value());
  readonly label = computed(() => this._label());
  readonly placeholder = computed(() => this._placeholder());
  readonly helper = computed(() => this._helper());
  readonly error = computed(() => this._error());
  readonly variant = computed(() => this._variant());
  readonly disabled = computed(() => this._disabled());
  readonly autoResize = computed(() => this._autoResize());

  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;

  // Inputs
  @Input('label')
  set labelInput(v: string | null) {
    this._label.set(v);
  }

  @Input('placeholder')
  set placeholderInput(v: string | null) {
    this._placeholder.set(v);
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
  set variantInput(v: TextareaVariant) {
    this._variant.set(v ?? 'default');
  }

  @Input('disabled')
  set disabledInput(v: boolean) {
    this._disabled.set(v);
  }

  @Input('autoResize')
  set autoResizeInput(v: boolean) {
    this._autoResize.set(v);
  }

  // CVA
  onChange = (value: string) => {};
  onTouched = () => {};

  writeValue(value: string): void {
    this._value.set(value ?? '');
    this.resize();
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
    const target = event.target as HTMLTextAreaElement;
    this._value.set(target.value);
    this.onChange(target.value);
    this.resize();
  }

  ngAfterViewInit() {
    this.resize();
  }

  private resize() {
    if (!this.autoResize() || !this.textareaRef) return;

    const el = this.textareaRef.nativeElement;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  readonly classes = computed(() => ({
    'ds-textarea': true,
    [`ds-textarea--${this.variant()}`]: true,
    'ds-textarea--error': !!this.error(),
    'ds-textarea--disabled': this.disabled(),
  }));
}
