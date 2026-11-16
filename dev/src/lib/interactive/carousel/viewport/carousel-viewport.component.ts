import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from '../carousel.component';

/**
 * ds-carousel-viewport
 *
 * Viewport + track wrapper for the headless carousel.
 *
 * Responsibilities:
 * - provides the clipping viewport (overflow hidden)
 * - positions the track using transform based on carousel.index()
 * - contains projected <ds-carousel-item> elements
 *
 * No logic related to navigation, looping, or state.
 * All logic lives in ds-carousel (root).
 */

@Component({
  selector: 'ds-carousel-viewport',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel-viewport.component.html',
  styleUrls: ['./carousel-viewport.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselViewportComponent {
  readonly carousel = inject(CarouselComponent);
}
