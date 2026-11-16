import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * ds-breadcrumb
 * Navigation primitive for hierarchical page structure.
 * Renders a list of breadcrumb items with separators.
 * Pure visual component — no routing logic inside.
 */
export interface BreadcrumbItem {
  label: string;
  link?: string | any[];
  active?: boolean;
}

@Component({
  selector: 'ds-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  private readonly _items = signal<BreadcrumbItem[]>([]);

  readonly items = computed(() => this._items());

  @Input()
  set itemsInput(value: BreadcrumbItem[]) {
    this._items.set(value ?? []);
  }
}
