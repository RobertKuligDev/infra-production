import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-avatar
 * Visual primitive for user/entity representation.
 * Supports image or initials-based placeholder.
 */
export type AvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'ds-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  private readonly _size = signal<AvatarSize>('md');

  readonly size = computed(() => this._size());

  @Input() src: string | null = null;
  @Input() alt: string = '';

  @Input('size')
  set sizeInput(value: AvatarSize) {
    this._size.set(value ?? 'md');
  }

  readonly classes = computed(() => ({
    'ds-avatar': true,
    [`ds-avatar--${this.size()}`]: true,
  }));
}
