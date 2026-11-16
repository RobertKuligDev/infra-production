import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-menu-group
 *
 * Groups menu items under a label.
 */

@Component({
  selector: 'ds-menu-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-group.component.html',
  styleUrls: ['./menu-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuGroupComponent {
  @Input() label = '';
}
