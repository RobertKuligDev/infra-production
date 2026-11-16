import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-popover
 *
 * Headless popover root component.
 *
 * Responsibilities:
 * - manages open/closed state
 * - exposes API: open(), close(), toggle()
 * - exposes alignment + side (top/bottom/left/right)
 * - provides context for trigger and panel via DI
 *
 * Notes:
 * - no overlay (DS 2.5 keeps it simple)
 * - panel handles positioning relative to trigger
 */
export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';
export type PopoverAlign = 'start' | 'center' | 'end';

@Component({
  selector: 'ds-popover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent {
  /** Open/closed state */
  private readonly _open = signal(false);

  /** Side relative to trigger */
  private readonly _side = signal<PopoverSide>('bottom');

  /** Alignment relative to trigger */
  private readonly _align = signal<PopoverAlign>('start');

  readonly open = computed(() => this._open());
  readonly side = computed(() => this._side());
  readonly align = computed(() => this._align());

  @Input() set sideInput(v: PopoverSide) {
    this._side.set(v ?? 'bottom');
  }
  @Input() set alignInput(v: PopoverAlign) {
    this._align.set(v ?? 'start');
  }

  openPopover() {
    this._open.set(true);
  }
  closePopover() {
    this._open.set(false);
  }
  togglePopover() {
    this._open.set(!this.open());
  }
}
