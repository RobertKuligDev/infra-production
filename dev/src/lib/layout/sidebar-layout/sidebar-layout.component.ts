import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Constraint-based API for sidebar width and spacing.
 * Only predefined token keys are allowed.
 */
export type SidebarWidth = 'sm' | 'md' | 'lg';
export type SidebarGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component-level tokens (Level 2.5).
 * Maps semantic spacing → runtime CSS variables.
 */
const SIDEBAR_GAP_MAP: Record<SidebarGap, string> = {
  xs: 'var(--space-2)',
  sm: 'var(--space-3)',
  md: 'var(--space-5)',
  lg: 'var(--space-7)',
  xl: 'var(--space-9)',
};

/**
 * Maps width tokens → CSS values.
 */
const SIDEBAR_WIDTH_MAP: Record<SidebarWidth, string> = {
  sm: '220px',
  md: '280px',
  lg: '340px',
};

@Component({
  selector: 'ds-sidebar-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-layout.component.html',
  styleUrls: ['./sidebar-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarLayoutComponent {
  /**
   * Internal reactive state using Angular Signals.
   */
  private readonly _width = signal<SidebarWidth>('md');
  private readonly _gap = signal<SidebarGap>('lg');
  private readonly _reverse = signal<boolean>(false);
  private readonly _stackOnMobile = signal<boolean>(true);

  /**
   * Public API — constraint-based inputs.
   */
  @Input()
  set width(value: SidebarWidth) {
    this._width.set(value ?? 'md');
  }

  @Input()
  set gap(value: SidebarGap) {
    this._gap.set(value ?? 'lg');
  }

  @Input()
  set reverse(value: boolean) {
    this._reverse.set(!!value);
  }

  @Input()
  set stackOnMobile(value: boolean) {
    this._stackOnMobile.set(!!value);
  }

  /**
   * Runtime CSS variables — component tokens → semantic tokens.
   */
  readonly styleVars = computed(() => ({
    '--sidebar-width': SIDEBAR_WIDTH_MAP[this._width()],
    '--sidebar-gap': SIDEBAR_GAP_MAP[this._gap()],
  }));

  /**
   * BEM classes — deterministic and SSR-safe.
   */
  readonly classes = computed(() => {
    const base = 'sidebar-layout';
    return {
      [base]: true,
      [`${base}--reverse`]: this._reverse(),
      [`${base}--stack-mobile`]: this._stackOnMobile(),
    };
  });
}
