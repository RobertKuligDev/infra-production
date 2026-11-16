import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverComponent } from '../../popover/popover.component';

/**
 * ds-menu-item
 *
 * Single actionable item inside menu.
 *
 * Responsibilities:
 * - emits select event
 * - closes popover on click
 * - provides ARIA role="menuitem"
 */

@Component({
  selector: 'ds-menu-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent {
  private readonly popover = inject(PopoverComponent);

  @Input() value: unknown;
  @Output() select = new EventEmitter<unknown>();

  onClick() {
    this.select.emit(this.value);
    this.popover.closePopover();
  }
}
