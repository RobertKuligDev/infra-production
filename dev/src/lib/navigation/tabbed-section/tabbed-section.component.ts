import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Tabbed Section UI component.
 * Provides a structured section with optional header and integrated tabs.
 * Uses component-level tokens and integrates with layout primitives.
 */

@Component({
  selector: 'ds-tabbed-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabbed-section.component.html',
  styleUrls: ['./tabbed-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabbedSectionComponent {
  private readonly _title = signal<string | null>(null);
  private readonly _description = signal<string | null>(null);

  readonly title = computed(() => this._title());
  readonly description = computed(() => this._description());
  readonly hasTitle = computed(() => !!this._title());
  readonly hasDescription = computed(() => !!this._description());

  @Input()
  set titleInput(value: string | null) {
    this._title.set(value);
  }

  @Input()
  set descriptionInput(value: string | null) {
    this._description.set(value);
  }

  readonly classes = computed(() => ({
    'ds-tabbed-section': true,
  }));
}
