import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-dropdown
 *
 * Headless dropdown root.
 *
 * Responsibilities:
 * - manages open/closed state
 * - exposes API: open(), close(), toggle()
 * - exposes alignment/variant
 * - provides context for trigger/panel/items via inject()
 *
 * Notes:
 * - no UI assumptions, only state + signals
 */
export type DropdownVariant = 'default' | 'subtle' | 'contrast';
export type DropdownAlign = 'start' | 'end';

@Component({
  selector: 'ds-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent {
  /** Open/closed state */
  private readonly _open = signal<boolean>(false);

  /** Visual variant */
  private readonly _variant = signal<DropdownVariant>('default');

  /** Horizontal alignment of panel relative to trigger */
  private readonly _align = signal<DropdownAlign>('start');

  readonly open = computed(() => this._open());
  readonly variant = computed(() => this._variant());
  readonly align = computed(() => this._align());

  @Input() set variantInput(v: DropdownVariant) {
    this._variant.set(v ?? 'default');
  }
  @Input() set alignInput(v: DropdownAlign) {
    this._align.set(v ?? 'start');
  }

  /** Opens the dropdown */
  openDropdown() {
    this._open.set(true);
  }

  /** Closes the dropdown */
  closeDropdown() {
    this._open.set(false);
  }

  /** Toggles open/closed state */
  toggleDropdown() {
    this._open.set(!this.open());
  }
}
