import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../dropdown.component';

/**
 * ds-dropdown-item
 *
 * Single clickable item inside dropdown panel.
 *
 * Responsibilities:
 * - handles click
 * - optionally closes dropdown on select
 *
 * Notes:
 * - headless: no opinion on what "select" means
 */

@Component({
  selector: 'ds-dropdown-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-item.component.html',
  styleUrls: ['./dropdown-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownItemComponent {
  private readonly dropdown = inject(DropdownComponent);

  /** Optional value emitted on select */
  @Input() value: unknown;

  /** Emits when item is selected */
  @Output() select = new EventEmitter<unknown>();

  onClick() {
    this.select.emit(this.value);
    this.dropdown.closeDropdown();
  }
}
