import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Sidebar UI component.
 * Provides styled sidebar container with optional header, description, and actions.
 * Uses component-level tokens and integrates with sidebar-layout primitive.
 */
export type SidebarVariant = 'default' | 'subtle' | 'contrast';
export type SidebarAlign = 'start' | 'center' | 'end';

@Component({
  selector: 'ds-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly _title = signal<string | null>(null);
  private readonly _description = signal<string | null>(null);
  private readonly _variant = signal<SidebarVariant>('default');
  private readonly _align = signal<SidebarAlign>('start');

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
  set variantInput(value: SidebarVariant) {
    this._variant.set(value ?? 'default');
  }

  @Input()
  set alignInput(value: SidebarAlign) {
    this._align.set(value ?? 'start');
  }

  /**
   * BEM classes — deterministic and SSR-safe.
   */
  readonly classes = computed(() => {
    const base = 'ds-sidebar';

    return {
      [base]: true,
      [`${base}--${this.variant()}`]: true,
      [`${base}--align-${this.align()}`]: true,
    };
  });
}
