import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Constraint-based API for vertical section spacing.
 * Only predefined token keys are allowed.
 */
export type SectionPadding = 'tight' | 'base' | 'wide';

/**
 * Component-level tokens (Level 2.5).
 * These tokens map semantic spacing → runtime CSS variables.
 */
const SECTION_PADDING_MAP: Record<SectionPadding, string> = {
  tight: 'var(--section-tight)',
  base: 'var(--section-base)',
  wide: 'var(--section-wide)',
};

@Component({
  selector: 'ds-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionComponent {
  /**
   * Internal reactive state using Angular Signals.
   */
  private readonly _padding = signal<SectionPadding>('base');
  private readonly _gap = signal<'none' | 'sm' | 'md' | 'lg'>('md');

  /**
   * Public API — constraint-based inputs.
   */
  @Input()
  set padding(value: SectionPadding) {
    this._padding.set(value ?? 'base');
  }

  @Input()
  set gap(value: 'none' | 'sm' | 'md' | 'lg') {
    this._gap.set(value ?? 'md');
  }

  /**
   * Runtime CSS variables — component tokens → semantic tokens.
   */
  readonly styleVars = computed(() => ({
    '--section-padding': SECTION_PADDING_MAP[this._padding()],
    '--section-gap': this.resolveGap(this._gap()),
  }));

  /**
   * Maps gap tokens to semantic spacing.
   */
  private resolveGap(gap: 'none' | 'sm' | 'md' | 'lg'): string {
    switch (gap) {
      case 'none':
        return '0';
      case 'sm':
        return 'var(--space-4)';
      case 'md':
        return 'var(--space-7)';
      case 'lg':
        return 'var(--space-9)';
    }
  }

  /**
   * BEM base class — deterministic and SSR-safe.
   */
  readonly classes = computed(() => ({
    section: true,
  }));
}
