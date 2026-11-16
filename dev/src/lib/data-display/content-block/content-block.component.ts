import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Content Block UI component.
 * Provides structured content container with optional header and actions.
 * Uses component-level tokens and integrates with layout primitives.
 */
export type ContentBlockVariant = 'default' | 'subtle' | 'contrast';
export type ContentBlockAlign = 'start' | 'center' | 'end';

@Component({
  selector: 'ds-content-block',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-block.component.html',
  styleUrls: ['./content-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentBlockComponent {
  private readonly _title = signal<string | null>(null);
  private readonly _description = signal<string | null>(null);
  private readonly _variant = signal<ContentBlockVariant>('default');
  private readonly _align = signal<ContentBlockAlign>('start');

  /**
   * Public computed for template access.
   */
  readonly title = computed(() => this._title());
  readonly description = computed(() => this._description());
  readonly variant = computed(() => this._variant());
  readonly align = computed(() => this._align());

  readonly hasTitle = computed(() => !!this._title());
  readonly hasDescription = computed(() => !!this._description());

  /**
   * Inputs — constraint-based API.
   */
  @Input()
  set titleInput(value: string | null) {
    this._title.set(value);
  }

  @Input()
  set descriptionInput(value: string | null) {
    this._description.set(value);
  }

  @Input()
  set variantInput(value: ContentBlockVariant) {
    this._variant.set(value ?? 'default');
  }

  @Input()
  set alignInput(value: ContentBlockAlign) {
    this._align.set(value ?? 'start');
  }

  /**
   * BEM classes — deterministic and SSR-safe.
   */
  readonly classes = computed(() => {
    const base = 'ds-content-block';

    return {
      [base]: true,
      [`${base}--${this.variant()}`]: true,
      [`${base}--align-${this.align()}`]: true,
    };
  });
}
