import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
  signal,
} from '@angular/core';
import { AccordionComponent } from '../accordion.component';

/**
 * ds-accordion-item
 *
 * Single expandable accordion item.
 *
 * Responsibilities:
 * - manages its own open/closed state
 * - exposes toggle() and collapse()
 * - notifies parent accordion when opened (for single mode)
 * - provides ARIA attributes for accessibility
 *
 * Notes:
 * - Uses crypto.randomUUID() for stable id
 * - Headless logic only (UI in HTML/SCSS)
 */

@Component({
  selector: 'ds-accordion-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionItemComponent {
  private readonly parent = inject(AccordionComponent);

  private readonly _open = signal<boolean>(false);
  private readonly _id = crypto.randomUUID();

  readonly open = computed(() => this._open());
  readonly id = computed(() => this._id);

  @Input('open') set openInput(v: boolean) {
    this._open.set(v);
  }

  toggle() {
    const newState = !this.open();
    this._open.set(newState);

    if (newState) this.parent.closeOthers(this.id());
  }

  collapse() {
    this._open.set(false);
  }
}
