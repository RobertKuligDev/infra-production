import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SECTION_BLOCK } from '../section-header/section-header.component';

/**
 * Component-level tokens (Level 2.5)
 * These tokens define how a section behaves visually.
 * They map semantic tokens → runtime CSS variables.
 */
export type SectionPadding = 'tight' | 'base' | 'wide';
export type SectionBackground = 'none' | 'surface' | 'contrast';

const SECTION_PADDING_MAP: Record<SectionPadding, string> = {
  tight: 'var(--section-tight)',
  base: 'var(--section-base)',
  wide: 'var(--section-wide)',
};

const SECTION_BG_MAP: Record<SectionBackground, string> = {
  none: 'transparent',
  surface: 'var(--color-bg-surface)',
  contrast: 'var(--color-bg-elevated)',
};

@Component({
  selector: 'app-section-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-container.component.html',
  styleUrls: ['./section-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: SECTION_BLOCK,
      useFactory: (c: SectionContainerComponent) => c.id,
      deps: [SectionContainerComponent],
    },
  ],
})

export class SectionContainerComponent {
  /**
   * Internal reactive state using Angular Signals.
   * Ensures hydration safety and avoids template getters.
   */
  private readonly _id = signal<string | null>(null);
  private readonly _padding = signal<SectionPadding>('base');
  private readonly _background = signal<SectionBackground>('none');

  /**
   * Public API — constraint-based inputs.
   * Only token keys are allowed.
   */
  @Input()
  set id(value: string | null) {
    this._id.set(value);
  }

  @Input()
  set padding(value: SectionPadding) {
    this._padding.set(value ?? 'base');
  }

  @Input()
  set background(value: SectionBackground) {
    this._background.set(value ?? 'none');
  }

  /**
   * Computed section ID — SSR-safe.
   */
  readonly sectionId = computed(() => {
    const id = this._id();
    return id && id.trim().length > 0 ? id : null;
  });

  /**
   * Runtime CSS variables — component tokens → semantic tokens.
   * This ensures full separation of concerns.
   */
  readonly styleVars = computed(() => ({
    '--section-padding': SECTION_PADDING_MAP[this._padding()],
    '--section-bg': SECTION_BG_MAP[this._background()],
  }));
}
