import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Input,
  signal,
} from '@angular/core';

/**
 * ds-accordion
 *
 * Root accordion wrapper controlling expansion behavior.
 *
 * Responsibilities:
 * - exposes `mode` (single/multiple)
 * - exposes `variant` (default/subtle/contrast)
 * - coordinates closing other items when mode === 'single'
 * - provides headless logic only (no UI)
 *
 * Notes:
 * - Does NOT import AccordionItemComponent (content projection)
 * - Items communicate with parent via inject(AccordionComponent)
 */
export type AccordionMode = 'single' | 'multiple';
export type AccordionVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent {
  private readonly _mode = signal<AccordionMode>('multiple');
  private readonly _variant = signal<AccordionVariant>('default');

  readonly mode = computed(() => this._mode());
  readonly variant = computed(() => this._variant());

  @Input('mode') set modeInput(v: AccordionMode) {
    this._mode.set(v ?? 'multiple');
  }
  @Input('variant') set variantInput(v: AccordionVariant) {
    this._variant.set(v ?? 'default');
  }

  // Called by children
  closeOthers(exceptId: string) {
    if (this.mode() !== 'single') return;
    const items = document.querySelectorAll('ds-accordion-item');
    items.forEach((el: any) => {
      if (el.id !== exceptId) el.collapse();
    });
  }
}
