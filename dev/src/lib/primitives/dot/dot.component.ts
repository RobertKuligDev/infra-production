import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-dot
 * Atomic visual primitive for neutral bullet indicators.
 * Used in lists, timelines, micro-navigation, and subtle UI markers.
 * No logic, no interactivity — pure visual element.
 */
export type DotSize = 'xs' | 'sm' | 'md';
export type DotVariant = 'default' | 'strong' | 'contrast';

@Component({
  selector: 'ds-dot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dot.component.html',
  styleUrls: ['./dot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DotComponent {
  private readonly _size = signal<DotSize>('sm');
  private readonly _variant = signal<DotVariant>('default');

  readonly size = computed(() => this._size());
  readonly variant = computed(() => this._variant());

  @Input('size')
  set sizeInput(value: DotSize) {
    this._size.set(value ?? 'sm');
  }

  @Input('variant')
  set variantInput(value: DotVariant) {
    this._variant.set(value ?? 'default');
  }

  readonly classes = computed(() => ({
    'ds-dot': true,
    [`ds-dot--${this.size()}`]: true,
    [`ds-dot--${this.variant()}`]: true,
  }));
}
