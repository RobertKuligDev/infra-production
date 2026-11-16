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
 * ds-navigation-item
 * Atomic navigation primitive for headers, sidebars, menus and mobile navigation.
 * Supports active state, routerLink and variant styling.
 * No logic — pure visual element.
 */
export type NavItemVariant = 'default' | 'accent' | 'danger';

@Component({
  selector: 'ds-navigation-item',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation-item.component.html',
  styleUrls: ['./navigation-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationItemComponent {
  private readonly _variant = signal<NavItemVariant>('default');
  private readonly _active = signal<boolean>(false);

  readonly variant = computed(() => this._variant());
  readonly active = computed(() => this._active());

  @Input('variant')
  set variantInput(value: NavItemVariant) {
    this._variant.set(value ?? 'default');
  }

  @Input('active')
  set activeInput(value: boolean) {
    this._active.set(value ?? false);
  }

  @Input() link: string | any[] | null = null;

  readonly classes = computed(() => ({
    'ds-nav-item': true,
    [`ds-nav-item--${this.variant()}`]: true,
    'ds-nav-item--active': this.active(),
  }));
}
