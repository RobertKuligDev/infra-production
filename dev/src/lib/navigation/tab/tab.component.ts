import {
  ChangeDetectionStrategy,
  Component,
  Input,
  HostListener,
  inject,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from '../tabs/tabs.component';

/**
 * Tab UI Control.
 * Represents a single tab trigger inside ds-tabs.
 * Handles active state, ARIA roles, and keyboard interactions.
 */
export type TabVariant = 'default' | 'pill' | 'segmented';

@Component({
  selector: 'ds-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabComponent {
  private readonly tabs = inject(TabsComponent);

  private readonly _id = signal<string>('');
  private readonly _variant = signal<TabVariant>('default');

  readonly id = computed(() => this._id());
  readonly variant = computed(() => this._variant());

  readonly isActive = computed(() => this.tabs.active() === this.id());

  @Input()
  set idInput(value: string) {
    this._id.set(value);
  }

  @Input()
  set variantInput(value: TabVariant) {
    this._variant.set(value ?? 'default');
  }

  activate() {
    this.tabs.setActive(this.id());
  }

  @HostListener('click')
  onClick() {
    this.activate();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.activate();
    }
  }

  readonly classes = computed(() => {
    const base = 'ds-tab';

    return {
      [base]: true,
      [`${base}--active`]: this.isActive(),
      [`${base}--${this.variant()}`]: true,
    };
  });
}
