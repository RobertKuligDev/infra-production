import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Constraint-based API for split layout.
 * Only predefined token keys are allowed.
 */
export type SplitGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SplitRatio = '1-1' | '1-2' | '2-1';

/**
 * Component-level tokens (Level 2.5).
 * Maps semantic spacing → runtime CSS variables.
 */
const SPLIT_GAP_MAP: Record<SplitGap, string> = {
  xs: 'var(--space-2)',
  sm: 'var(--space-3)',
  md: 'var(--space-5)',
  lg: 'var(--space-7)',
  xl: 'var(--space-9)',
};

/**
 * Maps ratio tokens → CSS grid template values.
 */
const SPLIT_RATIO_MAP: Record<SplitRatio, string> = {
  '1-1': '1fr 1fr',
  '1-2': '1fr 2fr',
  '2-1': '2fr 1fr',
};

@Component({
  selector: 'ds-split',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './split.component.html',
  styleUrls: ['./split.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitComponent {
  /**
   * Internal reactive state using Angular Signals.
   */
  private readonly _gap = signal<SplitGap>('lg');
  private readonly _ratio = signal<SplitRatio>('1-1');
  private readonly _reverse = signal<boolean>(false);

  /**
   * Public API — constraint-based inputs.
   */
  @Input()
  set gap(value: SplitGap) {
    this._gap.set(value ?? 'lg');
  }

  @Input()
  set ratio(value: SplitRatio) {
    this._ratio.set(value ?? '1-1');
  }

  @Input()
  set reverse(value: boolean) {
    this._reverse.set(!!value);
  }

  /**
   * Runtime CSS variables — component tokens → semantic tokens.
   */
  readonly styleVars = computed(() => ({
    '--split-gap': SPLIT_GAP_MAP[this._gap()],
    '--split-ratio': SPLIT_RATIO_MAP[this._ratio()],
  }));

  /**
   * BEM classes — deterministic and SSR-safe.
   */
  readonly classes = computed(() => {
    const base = 'split';
    return {
      [base]: true,
      [`${base}--reverse`]: this._reverse(),
    };
  });
}
