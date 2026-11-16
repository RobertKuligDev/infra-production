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
 * ds-file
 * File picker with drag & drop, multiple mode, label, helper, error,
 * and full CVA integration.
 */
export type FileVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-file',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileComponent),
      multi: true,
    },
  ],
})
export class FileComponent {
  private readonly _files = signal<File[]>([]);
  private readonly _label = signal<string | null>(null);
  private readonly _helper = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _variant = signal<FileVariant>('default');
  private readonly _disabled = signal<boolean>(false);
  private readonly _multiple = signal<boolean>(false);
  private readonly _dragOver = signal<boolean>(false);

  readonly files = computed(() => this._files());
  readonly label = computed(() => this._label());
  readonly helper = computed(() => this._helper());
  readonly error = computed(() => this._error());
  readonly variant = computed(() => this._variant());
  readonly disabled = computed(() => this._disabled());
  readonly multiple = computed(() => this._multiple());
  readonly dragOver = computed(() => this._dragOver());

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
  @Input('variant') set variantInput(v: FileVariant) {
    this._variant.set(v ?? 'default');
  }
  @Input('disabled') set disabledInput(v: boolean) {
    this._disabled.set(v);
  }
  @Input('multiple') set multipleInput(v: boolean) {
    this._multiple.set(v);
  }

  // CVA
  onChange = (value: File[] | File | null) => {};
  onTouched = () => {};

  writeValue(value: File[] | File | null): void {
    if (!value) {
      this._files.set([]);
      return;
    }
    this._files.set(Array.isArray(value) ? value : [value]);
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

  // File selection
  onFileSelect(event: Event) {
    if (this.disabled()) return;

    const input = event.target as HTMLInputElement;
    const list = input.files ? Array.from(input.files) : [];

    this._files.set(list);
    this.onChange(this.multiple() ? list : (list[0] ?? null));
  }

  // Drag & drop
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent) {
    if (this.disabled()) return;
    event.preventDefault();
    this._dragOver.set(true);
  }

  @HostListener('dragleave')
  onDragLeave() {
    this._dragOver.set(false);
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    if (this.disabled()) return;
    event.preventDefault();
    this._dragOver.set(false);

    const list = event.dataTransfer?.files
      ? Array.from(event.dataTransfer.files)
      : [];

    this._files.set(list);
    this.onChange(this.multiple() ? list : (list[0] ?? null));
  }

  readonly classes = computed(() => ({
    'ds-file': true,
    [`ds-file--${this.variant()}`]: true,
    'ds-file--error': !!this.error(),
    'ds-file--disabled': this.disabled(),
    'ds-file--dragover': this.dragOver(),
  }));
}
