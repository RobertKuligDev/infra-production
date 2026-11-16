import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../dropdown.component';

/**
 * ds-dropdown-trigger
 *
 * Clickable trigger for the dropdown.
 *
 * Responsibilities:
 * - toggles dropdown open/closed
 * - forwards any projected content (button, icon, etc.)
 *
 * Notes:
 * - no styling assumptions, only behavior
 */

@Component({
  selector: 'ds-dropdown-trigger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-trigger.component.html',
  styleUrls: ['./dropdown-trigger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownTriggerComponent {
  private readonly dropdown = inject(DropdownComponent);

  onClick() {
    this.dropdown.toggleDropdown();
  }
}
