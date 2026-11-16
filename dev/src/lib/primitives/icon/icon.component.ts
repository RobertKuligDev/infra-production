import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-icon
 * Atomic visual primitive for rendering SVG icons.
 * Supports size and color variants. No logic — pure visual element.
 */
export type IconSize = 'sm' | 'md' | 'lg';
export type IconColor = 'primary' | 'secondary' | 'muted' | 'inverse';

@Component({
  selector: 'ds-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  private readonly _size = signal<IconSize>('md');
  private readonly _color = signal<IconColor>('primary');

  readonly size = computed(() => this._size());
  readonly color = computed(() => this._color());

  @Input('size')
  set sizeInput(value: IconSize) {
    this._size.set(value ?? 'md');
  }

  @Input('color')
  set colorInput(value: IconColor) {
    this._color.set(value ?? 'primary');
  }

  /**
   * Optional: allow passing an external SVG path via src.
   * If provided, <img> is rendered instead of <ng-content>.
   */
  @Input() src: string | null = null;

  readonly classes = computed(() => ({
    'ds-icon': true,
    [`ds-icon--${this.size()}`]: true,
    [`ds-icon--${this.color()}`]: true,
  }));
}
