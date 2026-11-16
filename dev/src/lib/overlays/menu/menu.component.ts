import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-menu
 *
 * Headless menu root.
 *
 * Responsibilities:
 * - provides ARIA role="menu"
 * - hosts menu items, groups, separators
 * - no state (state lives in ds-popover)
 *
 * Notes:
 * - used inside <ds-popover-panel>
 * - no UI assumptions
 */

@Component({
  selector: 'ds-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {}
