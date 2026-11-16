import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-carousel-item
 *
 * Represents a single slide inside the carousel track.
 *
 * Responsibilities:
 * - provides structural wrapper for slide content
 * - participates in the carousel layout (100% width)
 * - contains no logic (headless)
 */

@Component({
  selector: 'ds-carousel-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel-item.component.html',
  styleUrls: ['./carousel-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselItemComponent {}
