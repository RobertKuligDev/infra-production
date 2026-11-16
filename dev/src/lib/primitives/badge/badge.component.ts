import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-badge
 * Visual primitive used to annotate UI elements (status, category, count).
 * No logic, no interactivity — pure visual atom.
 */
export type BadgeVariant =
  | 'default'
  | 'subtle'
  | 'contrast'
  | 'success'
  | 'warning'
  | 'danger';

@Component({
  selector: 'ds-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeComponent {
  private readonly _variant = signal<BadgeVariant>('default');

  readonly variant = computed(() => this._variant());

  @Input('variant')
  set variantInput(value: BadgeVariant) {
    this._variant.set(value ?? 'default');
  }

  readonly classes = computed(() => ({
    'ds-badge': true,
    [`ds-badge--${this.variant()}`]: true,
  }));
}
