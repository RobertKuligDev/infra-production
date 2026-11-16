import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Grid column configuration — constraint-based API.
 * Only token keys are allowed, never numeric values.
 */
export type GridColumns = 'auto' | 'fluid' | '2' | '3' | '4';

/**
 * Gap tokens — mapped to semantic spacing tokens.
 * Prevents arbitrary spacing values (e.g., "13px").
 */
export type GridGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component-level token mapping (Level 2.5).
 * This layer decouples layout primitives from raw spacing primitives.
 * Designers can change spacing scale without modifying component logic.
 */
const GRID_GAP_TOKEN_MAP: Record<GridGap, string> = {
  xs: 'var(--space-2)',
  sm: 'var(--space-3)',
  md: 'var(--space-5)',
  lg: 'var(--space-7)',
  xl: 'var(--space-9)',
};

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridComponent {
  /**
   * Internal reactive state using Angular Signals.
   * Ensures hydration safety and avoids getter re-evaluation.
   */
  private readonly _columns = signal<GridColumns>('auto');
  private readonly _gap = signal<GridGap>('md');

  /**
   * Public API — constraint-based inputs.
   * Only token keys are allowed.
   */
  @Input()
  set columns(value: GridColumns) {
    this._columns.set(value ?? 'auto');
  }

  @Input()
  set gap(value: GridGap) {
    this._gap.set(value ?? 'md');
  }

  /**
   * Base BEM block name.
   * Kept as a constant to ensure deterministic class generation.
   */
  readonly base = 'grid';

  /**
   * Computed BEM classes.
   * SSR-safe, hydration-safe, and avoids template getters.
   */
  readonly classes = computed(() => {
    const cols = this._columns();
    return {
      [this.base]: true,
      [`${this.base}--cols-${cols}`]: true,
    };
  });

  /**
   * Runtime CSS variables.
   * Component-level tokens → semantic tokens → primitives.
   * Ensures full separation of concerns.
   */
  readonly styleVars = computed(() => ({
    '--grid-gap': GRID_GAP_TOKEN_MAP[this._gap()],
  }));
}
