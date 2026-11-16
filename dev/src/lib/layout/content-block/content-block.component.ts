import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Constraint-based API for vertical spacing inside a content block.
 * Only spacing token keys are allowed.
 */
export type ContentBlockGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component-level tokens (Level 2.5).
 * Maps semantic spacing → runtime CSS variables.
 */
const CONTENT_BLOCK_GAP_MAP: Record<ContentBlockGap, string> = {
  xs: 'var(--space-2)',
  sm: 'var(--space-3)',
  md: 'var(--space-5)',
  lg: 'var(--space-7)',
  xl: 'var(--space-9)',
};

@Component({
  selector: 'ds-content-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-block.component.html',
  styleUrls: ['./content-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentBlockComponent {
  /**
   * Internal reactive state using Angular Signals.
   */
  private readonly _gap = signal<ContentBlockGap>('md');
  private readonly _maxWidth = signal<'narrow' | 'base' | 'wide'>('base');

  /**
   * Public API — constraint-based inputs.
   */
  @Input()
  set gap(value: ContentBlockGap) {
    this._gap.set(value ?? 'md');
  }

  @Input()
  set maxWidth(value: 'narrow' | 'base' | 'wide') {
    this._maxWidth.set(value ?? 'base');
  }

  /**
   * Runtime CSS variables — component tokens → semantic tokens.
   */
  readonly styleVars = computed(() => ({
    '--content-block-gap': CONTENT_BLOCK_GAP_MAP[this._gap()],
    '--content-block-max-width': this.resolveMaxWidth(this._maxWidth()),
  }));

  /**
   * Maps width tokens to semantic max-width values.
   */
  private resolveMaxWidth(width: 'narrow' | 'base' | 'wide'): string {
    switch (width) {
      case 'narrow':
        return '50ch';
      case 'base':
        return '65ch';
      case 'wide':
        return '90ch';
    }
  }

  /**
   * BEM base class — deterministic and SSR-safe.
   */
  readonly classes = computed(() => ({
    'content-block': true,
  }));
}
