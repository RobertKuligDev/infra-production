import {
  ChangeDetectionStrategy,
  Component,
  Input,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-pagination
 *
 * Headless pagination component with full navigation logic.
 *
 * Responsibilities:
 * - manages current page
 * - exposes navigation API (next, prev, goTo, first, last)
 * - generates visible page range with ellipsis
 * - supports variant styling
 *
 * No UI logic in TS — only state + signals.
 */
export type PaginationVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'ds-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  // Inputs
  private readonly _page = signal<number>(1);
  private readonly _total = signal<number>(1);
  private readonly _variant = signal<PaginationVariant>('default');

  readonly page = computed(() => this._page());
  readonly total = computed(() => this._total());
  readonly variant = computed(() => this._variant());

  @Input() set pageInput(v: number) {
    this._page.set(v ?? 1);
  }
  @Input() set totalInput(v: number) {
    this._total.set(v ?? 1);
  }
  @Input() set variantInput(v: PaginationVariant) {
    this._variant.set(v ?? 'default');
  }

  // Utility type guard for page numbers
  isNumber(value: unknown): value is number {
    return typeof value === 'number';
  }

  // Navigation API
  goTo(p: number) {
    const next = Math.max(1, Math.min(this.total(), p));
    this._page.set(next);
  }

  next() {
    this.goTo(this.page() + 1);
  }

  prev() {
    this.goTo(this.page() - 1);
  }

  first() {
    this.goTo(1);
  }

  last() {
    this.goTo(this.total());
  }

  // Visible pages with ellipsis
  readonly pages = computed(() => {
    const total = this.total();
    const current = this.page();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [];

    pages.push(1);

    if (current > 3) pages.push('…');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('…');

    pages.push(total);

    return pages;
  });
}
