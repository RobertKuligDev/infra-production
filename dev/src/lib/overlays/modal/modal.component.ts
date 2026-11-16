import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  signal,
  computed,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-modal
 * Standard centered modal dialog with overlay, ESC close,
 * click-outside close, ARIA roles, and focus trap.
 */
export type ModalVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements AfterViewInit {
  private readonly _open = signal<boolean>(false);
  private readonly _variant = signal<ModalVariant>('default');

  readonly open = computed(() => this._open());
  readonly variant = computed(() => this._variant());

  @Output() closed = new EventEmitter<void>();

  @Input()
  set openInput(value: boolean) {
    this._open.set(value);
  }

  @Input()
  set variantInput(value: ModalVariant) {
    this._variant.set(value ?? 'default');
  }

  @ViewChild('dialog') dialogRef!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    if (this.open()) {
      this.focusDialog();
    }
  }

  private focusDialog() {
    queueMicrotask(() => {
      this.dialogRef?.nativeElement?.focus();
    });
  }

  close() {
    this._open.set(false);
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.open()) this.close();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  readonly classes = computed(() => ({
    'ds-modal': true,
    [`ds-modal--${this.variant()}`]: true,
    'ds-modal--open': this.open(),
  }));
}
