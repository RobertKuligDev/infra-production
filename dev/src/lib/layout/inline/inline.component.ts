import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Constraint-based API for inline layout.
 * Only spacing token keys are allowed.
 */
export type InlineGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component-level tokens (Level 2.5).
 * These tokens map semantic spacing → runtime CSS variables.
 */
const INLINE_GAP_MAP: Record<InlineGap, string> = {
  xs: 'var(--space-2)',
  sm: 'var(--space-3)',
  md: 'var(--space-4)',
  lg: 'var(--space-6)',
  xl: 'var(--space-8)',
};

@Component({
  selector: 'ds-inline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inline.component.html',
  styleUrls: ['./inline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineComponent {
  /**
   * Internal reactive state using Angular Signals.
   * Ensures hydration safety and avoids template getters.
   */
  private readonly _gap = signal<InlineGap>('md');
  private readonly _align = signal<'start' | 'center' | 'end'>('center');
  private readonly _justify = signal<
    'start' | 'center' | 'end' | 'between' | 'around'
  >('start');
  private readonly _wrap = signal<boolean>(false);

  /**
   * Public API — constraint-based inputs.
   * Only token keys and predefined values are allowed.
   */
  @Input()
  set gap(value: InlineGap) {
    this._gap.set(value ?? 'md');
  }

  @Input()
  set align(value: 'start' | 'center' | 'end') {
    this._align.set(value ?? 'center');
  }

  @Input()
  set justify(value: 'start' | 'center' | 'end' | 'between' | 'around') {
    this._justify.set(value ?? 'start');
  }

  @Input()
  set wrap(value: boolean) {
    this._wrap.set(!!value);
  }

  /**
   * Runtime CSS variables — component tokens → semantic tokens.
   */
  readonly styleVars = computed(() => ({
    '--inline-gap': INLINE_GAP_MAP[this._gap()],
  }));

  /**
   * BEM classes — deterministic and SSR-safe.
   */
  readonly classes = computed(() => {
    const base = 'inline';

    return {
      [base]: true,
      [`${base}--align-${this._align()}`]: true,
      [`${base}--justify-${this._justify()}`]: true,
      [`${base}--wrap`]: this._wrap(),
    };
  });
}
