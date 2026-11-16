import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from '../../ui/button/button.component';

/**
 * CTA Block UI component.
 * Provides structured call-to-action content with title, description, and button.
 * Uses component-level tokens and integrates with layout primitives.
 */
export type CtaBlockAlign = 'start' | 'center' | 'end';
export type CtaBlockVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-cta-block',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './cta-block.component.html',
  styleUrls: ['./cta-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaBlockComponent {
  private readonly _title = signal<string>('');
  private readonly _description = signal<string | null>(null);
  private readonly _buttonText = signal<string>('Learn more');
  private readonly _buttonLink = signal<string | string[]>('/');
  private readonly _align = signal<CtaBlockAlign>('start');
  private readonly _variant = signal<CtaBlockVariant>('default');

  /**
   * Public computed for template access.
   */
  readonly title = computed(() => this._title());
  readonly description = computed(() => this._description());
  readonly buttonText = computed(() => this._buttonText());
  readonly buttonLink = computed(() => this._buttonLink());
  readonly align = computed(() => this._align());
  readonly variant = computed(() => this._variant());

  /**
   * Inputs — constraint-based API.
   */
  @Input()
  set titleInput(value: string) {
    this._title.set(value ?? '');
  }

  @Input()
  set descriptionInput(value: string | null) {
    this._description.set(value);
  }

  @Input()
  set buttonTextInput(value: string) {
    this._buttonText.set(value ?? 'Learn more');
  }

  @Input()
  set buttonLinkInput(value: string | string[]) {
    this._buttonLink.set(value ?? '/');
  }

  @Input()
  set alignInput(value: CtaBlockAlign) {
    this._align.set(value ?? 'start');
  }

  @Input()
  set variantInput(value: CtaBlockVariant) {
    this._variant.set(value ?? 'default');
  }

  /**
   * BEM classes — deterministic and SSR-safe.
   */
  readonly classes = computed(() => {
    const base = 'ds-cta-block';

    return {
      [base]: true,
      [`${base}--align-${this.align()}`]: true,
      [`${base}--${this.variant()}`]: true,
    };
  });
}
