import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
  signal,
  computed,
  ElementRef,
  ViewChild,
  HostListener,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * ds-slider
 * Accessible slider with drag, keyboard control, min/max/step,
 * label, helper, error, variants, and full CVA integration.
 */
export type SliderVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true,
    },
  ],
})
export class SliderComponent implements AfterViewInit {
  private readonly _value = signal<number>(0);
  private readonly _label = signal<string | null>(null);
  private readonly _helper = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _variant = signal<SliderVariant>('default');
  private readonly _disabled = signal<boolean>(false);

  private readonly _min = signal<number>(0);
  private readonly _max = signal<number>(100);
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

  @ViewChild('track') trackRef!: ElementRef<HTMLDivElement>;

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
  @Input('variant') set variantInput(v: SliderVariant) {
    this._variant.set(v ?? 'default');
  }
  @Input('disabled') set disabledInput(v: boolean) {
    this._disabled.set(v);
  }

  @Input('min') set minInput(v: number) {
    this._min.set(v ?? 0);
  }
  @Input('max') set maxInput(v: number) {
    this._max.set(v ?? 100);
  }
  @Input('step') set stepInput(v: number) {
    this._step.set(v ?? 1);
  }

  // CVA
  onChange = (value: number) => {};
  onTouched = () => {};

  writeValue(value: number): void {
    this._value.set(this.clamp(value ?? 0));
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

  // Helpers
  private clamp(v: number): number {
    return Math.min(this.max(), Math.max(this.min(), v));
  }

  private snap(v: number): number {
    const step = this.step();
    return Math.round(v / step) * step;
  }

  // Drag logic
  private dragging = false;

  ngAfterViewInit() {}

  startDrag(event: MouseEvent | TouchEvent) {
    if (this.disabled()) return;
    this.dragging = true;
    this.updateFromEvent(event);
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  moveDrag(event: MouseEvent | TouchEvent) {
    if (!this.dragging) return;
    this.updateFromEvent(event);
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  endDrag() {
    this.dragging = false;
  }

  private updateFromEvent(event: any) {
    const track = this.trackRef.nativeElement;
    const rect = track.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;

    const ratio = (clientX - rect.left) / rect.width;
    const raw = this.min() + ratio * (this.max() - this.min());
    const snapped = this.snap(raw);
    const clamped = this.clamp(snapped);

    this._value.set(clamped);
    this.onChange(clamped);
  }

  // Keyboard
  onKey(event: KeyboardEvent) {
    if (this.disabled()) return;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        this.writeValue(this.value() - this.step());
        break;

      case 'ArrowRight':
      case 'ArrowUp':
        this.writeValue(this.value() + this.step());
        break;

      case 'Home':
        this.writeValue(this.min());
        break;

      case 'End':
        this.writeValue(this.max());
        break;

      case 'PageUp':
        this.writeValue(this.value() + this.step() * 10);
        break;

      case 'PageDown':
        this.writeValue(this.value() - this.step() * 10);
        break;
    }

    this.onChange(this.value());
  }

  readonly classes = computed(() => ({
    'ds-slider': true,
    [`ds-slider--${this.variant()}`]: true,
    'ds-slider--error': !!this.error(),
    'ds-slider--disabled': this.disabled(),
  }));
}
