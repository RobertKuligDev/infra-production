import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../dropdown.component';

/**
 * ds-dropdown-panel
 *
 * Panel containing dropdown items.
 *
 * Responsibilities:
 * - shows/hides based on dropdown.open()
 * - positions relative to root
 * - exposes alignment via parent
 *
 * Notes:
 * - no item logic, only container
 */

@Component({
  selector: 'ds-dropdown-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-panel.component.html',
  styleUrls: ['./dropdown-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownPanelComponent {
  readonly dropdown = inject(DropdownComponent);
}
