import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverComponent } from '../popover.component';

/**
 * ds-popover-panel
 *
 * Floating panel displayed relative to trigger.
 *
 * Responsibilities:
 * - shows/hides based on popover.open()
 * - positions based on popover.side() + popover.align()
 * - hosts projected content
 */

@Component({
  selector: 'ds-popover-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popover-panel.component.html',
  styleUrls: ['./popover-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverPanelComponent {
  readonly popover = inject(PopoverComponent);
}
