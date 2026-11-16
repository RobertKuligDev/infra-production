import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-context-menu
 *
 * Headless context menu root.
 *
 * Responsibilities:
 * - manages open/closed state
 * - stores cursor position for panel placement
 * - provides API for trigger + panel
 *
 * Notes:
 * - uses absolute positioning (not relative to trigger)
 * - works with right-click trigger directive
 */

@Component({
  selector: 'ds-context-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuComponent {
  /** Open/closed state */
  private readonly _open = signal(false);

  /** Cursor position for panel placement */
  private readonly _x = signal(0);
  private readonly _y = signal(0);

  readonly open = computed(() => this._open());
  readonly x = computed(() => this._x());
  readonly y = computed(() => this._y());

  /** Opens menu at cursor position */
  openAt(x: number, y: number) {
    this._x.set(x);
    this._y.set(y);
    this._open.set(true);
  }

  /** Closes menu */
  close() {
    this._open.set(false);
  }
}
