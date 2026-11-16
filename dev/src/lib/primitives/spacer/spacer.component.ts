import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-spacer
 * Micro layout primitive for vertical spacing between UI elements.
 * Uses design-system spacing scale. No logic — pure layout helper.
 */
export type SpacerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'ds-spacer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spacer.component.html',
  styleUrls: ['./spacer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpacerComponent {
  private readonly _size = signal<SpacerSize>('md');

  readonly size = computed(() => this._size());

  @Input('size')
  set sizeInput(value: SpacerSize) {
    this._size.set(value ?? 'md');
  }

  readonly classes = computed(() => ({
    'ds-spacer': true,
    [`ds-spacer--${this.size()}`]: true,
  }));
}
