import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from '../carousel.component';

/**
 * ds-carousel-dots
 *
 * Pagination dots for the headless carousel.
 *
 * Responsibilities:
 * - renders one dot per slide
 * - highlights the active slide
 * - invokes carousel.goTo(i) on click
 * - contains no carousel logic (delegated to ds-carousel)
 */

@Component({
  selector: 'ds-carousel-dots',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel-dots.component.html',
  styleUrls: ['./carousel-dots.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselDotsComponent {
  readonly carousel = inject(CarouselComponent);

  onSelect(i: number) {
    this.carousel.goTo(i);
  }
}
