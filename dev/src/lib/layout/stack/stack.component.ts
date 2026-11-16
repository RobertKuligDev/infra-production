import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Constraint-based API for vertical spacing.
 * Only spacing token keys are allowed.
 */
export type StackGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component-level tokens (Level 2.5).
 * Maps semantic spacing → runtime CSS variables.
 */
const STACK_GAP_MAP: Record<StackGap, string> = {
  xs: 'var(--space-2)',
  sm: 'var(--space-3)',
  md: 'var(--space-5)',
  lg: 'var(--space-7)',
  xl: 'var(--space-9)',
};

@Component({
  selector: 'ds-stack',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StackComponent {
  /**
   * Internal reactive state using Angular Signals.
   */
  private readonly _gap = signal<StackGap>('md');
  private readonly _align = signal<'start' | 'center' | 'end' | 'stretch'>(
    'stretch',
  );

  /**
   * Public API — constraint-based inputs.
   */
  @Input()
  set gap(value: StackGap) {
    this._gap.set(value ?? 'md');
  }

  @Input()
  set align(value: 'start' | 'center' | 'end' | 'stretch') {
    this._align.set(value ?? 'stretch');
  }

  /**
   * Runtime CSS variables — component tokens → semantic tokens.
   */
  readonly styleVars = computed(() => ({
    '--stack-gap': STACK_GAP_MAP[this._gap()],
  }));

  /**
   * BEM classes — deterministic and SSR-safe.
   */
  readonly classes = computed(() => {
    const base = 'stack';
    return {
      [base]: true,
      [`${base}--align-${this._align()}`]: true,
    };
  });
}
