import { Directive, HostListener, inject } from '@angular/core';
import { ContextMenuComponent } from '../context-menu.component';

/**
 * dsContextMenuTrigger
 *
 * Directive that opens context menu on right-click.
 *
 * Responsibilities:
 * - listens for native `contextmenu` event
 * - prevents default browser menu
 * - opens ds-context-menu at cursor position
 */

@Directive({
  selector: '[dsContextMenuTrigger]',
  standalone: true,
})
export class ContextMenuTriggerDirective {
  private readonly menu = inject(ContextMenuComponent);

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    this.menu.openAt(event.clientX, event.clientY);
  }
}
