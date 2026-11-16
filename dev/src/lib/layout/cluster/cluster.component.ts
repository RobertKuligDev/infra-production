import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Constraint-based API for cluster spacing.
 * Only spacing token keys are allowed.
 */
export type ClusterGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component-level tokens (Level 2.5).
 * Maps semantic spacing → runtime CSS variables.
 */
const CLUSTER_GAP_MAP: Record<ClusterGap, string> = {
  xs: 'var(--space-2)',
  sm: 'var(--space-3)',
  md: 'var(--space-5)',
  lg: 'var(--space-7)',
  xl: 'var(--space-9)',
};

@Component({
  selector: 'ds-cluster',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cluster.component.html',
  styleUrls: ['./cluster.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClusterComponent {
  /**
   * Internal reactive state using Angular Signals.
   */
  private readonly _gap = signal<ClusterGap>('md');
  private readonly _align = signal<'start' | 'center' | 'end' | 'stretch'>(
    'center',
  );
  private readonly _justify = signal<
    'start' | 'center' | 'end' | 'between' | 'around'
  >('start');
  private readonly _wrap = signal<boolean>(true);

  /**
   * Public API — constraint-based inputs.
   */
  @Input()
  set gap(value: ClusterGap) {
    this._gap.set(value ?? 'md');
  }

  @Input()
  set align(value: 'start' | 'center' | 'end' | 'stretch') {
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
    '--cluster-gap': CLUSTER_GAP_MAP[this._gap()],
  }));

  /**
   * BEM classes — deterministic and SSR-safe.
   */
  readonly classes = computed(() => {
    const base = 'cluster';
    return {
      [base]: true,
      [`${base}--align-${this._align()}`]: true,
      [`${base}--justify-${this._justify()}`]: true,
      [`${base}--nowrap`]: !this._wrap(),
    };
  });
}
