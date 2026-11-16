import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-menu-separator
 *
 * Visual separator between menu items.
 */

@Component({
  selector: 'ds-menu-separator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-separator.component.html',
  styleUrls: ['./menu-separator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSeparatorComponent {}
