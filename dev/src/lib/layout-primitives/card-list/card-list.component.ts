import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SECTION_BLOCK } from '../../tokens/section-block.token';

/**
 * Constraint-based API for card list.
 * Only token keys are allowed — no arbitrary numbers.
 */
export type CardListColumns = '2' | '3' | '4' | 'auto' | 'fluid';
export type CardListGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component-level tokens (Level 2.5)
 * These tokens define spacing and layout behavior for card lists.
 */
const CARD_LIST_GAP_MAP: Record<CardListGap, string> = {
  xs: 'var(--space-2)',
  sm: 'var(--space-3)',
  md: 'var(--space-5)',
  lg: 'var(--space-7)',
  xl: 'var(--space-9)',
};

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardListComponent {
  constructor(@Inject(SECTION_BLOCK) public block: string) {}

  /**
   * Internal reactive state using Angular Signals.
   */
  private readonly _columns = signal<CardListColumns>('3');
  private readonly _gap = signal<CardListGap>('lg');

  /**
   * Public API — constraint-based inputs.
   */
  @Input()
  set columns(value: CardListColumns) {
    this._columns.set(value ?? '3');
  }

  @Input()
  set gap(value: CardListGap) {
    this._gap.set(value ?? 'lg');
  }

  /**
   * BEM base class derived from section block context.
   */
  readonly base = computed(() => `${this.block}__list`);

  /**
   * Runtime CSS variables — component tokens → semantic tokens.
   */
  readonly styleVars = computed(() => ({
    '--list-gap': CARD_LIST_GAP_MAP[this._gap()],
    '--list-cols': this._columns(),
  }));
}
