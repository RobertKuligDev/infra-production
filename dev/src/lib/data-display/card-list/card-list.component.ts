import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Card List UI component.
 * Provides semantic grouping of card items with consistent spacing and variants.
 * Uses component-level tokens and integrates with layout primitives.
 */
export type CardListVariant = 'grid' | 'stack';

@Component({
  selector: 'ds-card-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardListComponent {
  private readonly _variant = signal<CardListVariant>('grid');
  private readonly _gap = signal<'sm' | 'md' | 'lg'>('md');

  @Input()
  set variant(value: CardListVariant) {
    this._variant.set(value ?? 'grid');
  }

  @Input()
  set gap(value: 'sm' | 'md' | 'lg') {
    this._gap.set(value ?? 'md');
  }

  readonly classes = computed(() => {
    const base = 'ds-card-list';

    return {
      [base]: true,
      [`${base}--${this._variant()}`]: true,
      [`${base}--gap-${this._gap()}`]: true,
    };
  });
}
