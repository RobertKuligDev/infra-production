import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  QueryList,
  Input,
  signal,
  computed,
  AfterContentInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselItemComponent } from './item/carousel-item.component';

/**
 * ds-carousel
 * Root headless carousel component.
 * Provides state, navigation, and configuration for all child components.
 *
 * Responsibilities:
 * - manages current slide index
 * - handles looping logic
 * - exposes navigation API (next, prev, goTo)
 * - provides variant styling
 * - coordinates children via dependency injection
 */
export type CarouselVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements AfterContentInit {
  @ContentChildren(CarouselItemComponent)
  items!: QueryList<CarouselItemComponent>;

  private readonly _index = signal<number>(0);
  private readonly _variant = signal<CarouselVariant>('default');
  private readonly _loop = signal<boolean>(false);

  readonly index = computed(() => this._index());
  readonly variant = computed(() => this._variant());
  readonly loop = computed(() => this._loop());
  readonly count = computed(() => this.items?.length ?? 0);

  @Input() set variantInput(v: CarouselVariant) {
    this._variant.set(v ?? 'default');
  }
  @Input() set loopInput(v: boolean) {
    this._loop.set(v);
  }

  ngAfterContentInit() {
    this.goTo(0);
  }

  goTo(i: number) {
    const total = this.count();
    if (total === 0) return;

    let next = i;

    if (this.loop()) {
      next = (i + total) % total;
    } else {
      next = Math.max(0, Math.min(total - 1, i));
    }

    this._index.set(next);
  }

  next() {
    this.goTo(this.index() + 1);
  }

  prev() {
    this.goTo(this.index() - 1);
  }

  isActive(i: number) {
    return this.index() === i;
  }
}
