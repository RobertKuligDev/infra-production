import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Card UI component.
 * Provides structured visual grouping with optional header, media, body, and footer.
 * Uses component-level tokens and integrates with layout primitives.
 */
export type CardVariant = 'default' | 'interactive' | 'elevated' | 'outlined';

@Component({
  selector: 'ds-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  private readonly _variant = signal<CardVariant>('default');

  @Input()
  set variant(value: CardVariant) {
    this._variant.set(value ?? 'default');
  }

  readonly classes = computed(() => {
    const base = 'ds-card';

    return {
      [base]: true,
      [`${base}--${this._variant()}`]: true,
    };
  });
}
