import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextMenuComponent } from '../context-menu.component';

/**
 * ds-context-menu-panel
 *
 * Floating panel positioned at cursor location.
 *
 * Responsibilities:
 * - positions itself using menu.x() and menu.y()
 * - shows/hides based on menu.open()
 * - hosts ds-menu inside
 */

@Component({
  selector: 'ds-context-menu-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-menu-panel.component.html',
  styleUrls: ['./context-menu-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuPanelComponent {
  readonly menu = inject(ContextMenuComponent);
}
