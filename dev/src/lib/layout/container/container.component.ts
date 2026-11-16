import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Constraint-based API for container width.
 * Only predefined token keys are allowed.
 */
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Component-level tokens (Level 2.5).
 * Maps semantic container sizes → runtime CSS variables.
 */
const CONTAINER_WIDTH_MAP: Record<ContainerSize, string> = {
  sm: 'var(--container-sm)',
  md: 'var(--container-md)',
  lg: 'var(--container-lg)',
  xl: 'var(--container-xl)',
  full: '100%',
};

@Component({
  selector: 'ds-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContainerComponent {
  /**
   * Internal reactive state using Angular Signals.
   */
  private readonly _size = signal<ContainerSize>('lg');

  /**
   * Public API — constraint-based input.
   */
  @Input()
  set size(value: ContainerSize) {
    this._size.set(value ?? 'lg');
  }

  /**
   * Runtime CSS variables — component tokens → semantic tokens.
   */
  readonly styleVars = computed(() => ({
    '--container-max-width': CONTAINER_WIDTH_MAP[this._size()],
  }));

  /**
   * BEM base class — deterministic and SSR-safe.
   */
  readonly classes = computed(() => ({
    container: true,
  }));
}
