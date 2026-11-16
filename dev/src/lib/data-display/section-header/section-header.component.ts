import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Section Header UI component.
 * Provides semantic heading, label, and description for section-level content.
 * Uses component-level tokens and integrates with layout primitives.
 */
export type SectionHeaderAlign = 'start' | 'center' | 'end';
export type SectionHeaderLevel = 'h1' | 'h2' | 'h3';

@Component({
  selector: 'ds-section-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeaderComponent {
  private readonly _label = signal<string | null>(null);
  private readonly _title = signal<string>('');
  private readonly _description = signal<string | null>(null);
  private readonly _align = signal<SectionHeaderAlign>('start');
  private readonly _level = signal<SectionHeaderLevel>('h2');

  /**
   * Public computed — required for template access.
   */
  readonly label = computed(() => this._label());
  readonly title = computed(() => this._title());
  readonly description = computed(() => this._description());
  readonly align = computed(() => this._align());
  readonly levelTag = computed(() => this._level());

  readonly hasLabel = computed(() => !!this._label());
  readonly hasDescription = computed(() => !!this._description());

  /**
   * Public API — constraint-based inputs.
   */
  @Input()
  set labelInput(value: string | null) {
    this._label.set(value);
  }

  @Input()
  set titleInput(value: string) {
    this._title.set(value ?? '');
  }

  @Input()
  set descriptionInput(value: string | null) {
    this._description.set(value);
  }

  @Input()
  set alignInput(value: SectionHeaderAlign) {
    this._align.set(value ?? 'start');
  }

  @Input()
  set levelInput(value: SectionHeaderLevel) {
    this._level.set(value ?? 'h2');
  }

  /**
   * BEM classes — deterministic and SSR-safe.
   */
  readonly classes = computed(() => {
    const base = 'ds-section-header';

    return {
      [base]: true,
      [`${base}--align-${this.align()}`]: true,
    };
  });
}
