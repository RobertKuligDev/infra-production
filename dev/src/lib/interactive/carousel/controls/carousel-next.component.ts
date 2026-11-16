import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from '../carousel.component';

/**
 * ds-carousel-next
 *
 * Headless next-slide control for the carousel.
 *
 * Responsibilities:
 * - invokes carousel.next()
 * - exposes no UI logic
 * - fully controlled by parent ds-carousel
 */

@Component({
  selector: 'ds-carousel-next',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel-next.component.html',
  styleUrls: ['./carousel-next.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselNextComponent {
  readonly carousel = inject(CarouselComponent);

  onClick() {
    this.carousel.next();
  }
}
