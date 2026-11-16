import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from '../carousel.component';

/**
 * ds-carousel-prev
 *
 * Headless previous-slide control for the carousel.
 *
 * Responsibilities:
 * - invokes carousel.prev()
 * - exposes no UI logic
 * - fully controlled by parent ds-carousel
 */

@Component({
  selector: 'ds-carousel-prev',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel-prev.component.html',
  styleUrls: ['./carousel-prev.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselPrevComponent {
  readonly carousel = inject(CarouselComponent);

  onClick() {
    this.carousel.prev();
  }
}
