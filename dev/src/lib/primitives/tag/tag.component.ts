import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-tag
 * Semantic visual primitive used for category and metadata labeling.
 * Supports variant styling and optional icon slot.
 * No logic, no interactivity — pure visual element.
 */
export type TagVariant = 'default' | 'muted' | 'accent' | 'outline';

@Component({
  selector: 'ds-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagComponent {
  private readonly _variant = signal<TagVariant>('default');

  readonly variant = computed(() => this._variant());

  @Input('variant')
  set variantInput(value: TagVariant) {
    this._variant.set(value ?? 'default');
  }

  readonly classes = computed(() => ({
    'ds-tag': true,
    [`ds-tag--${this.variant()}`]: true,
  }));
}
