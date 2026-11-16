import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverComponent } from '../popover.component';

/**
 * ds-popover-trigger
 *
 * Clickable trigger that toggles popover open/closed.
 *
 * Responsibilities:
 * - toggles popover state
 * - projects arbitrary content (button, icon, avatar)
 */

@Component({
  selector: 'ds-popover-trigger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popover-trigger.component.html',
  styleUrls: ['./popover-trigger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverTriggerComponent {
  private readonly popover = inject(PopoverComponent);

  onClick() {
    this.popover.togglePopover();
  }
}
