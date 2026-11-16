import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Tabs UI Control.
 * Provides interactive tablist with keyboard navigation, ARIA roles,
 * active state management, and variant/direction styling.
 */
export type TabsVariant = 'underline' | 'pill' | 'segmented';
export type TabsDirection = 'row' | 'column';
export type TabsAlign = 'start' | 'center' | 'end';

@Component({
  selector: 'ds-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
  private readonly _active = signal<string | null>(null);
  private readonly _variant = signal<TabsVariant>('underline');
  private readonly _direction = signal<TabsDirection>('row');
  private readonly _align = signal<TabsAlign>('start');

  /**
   * Public computed for template access.
   */
  readonly active = computed(() => this._active());
  readonly variant = computed(() => this._variant());
  readonly direction = computed(() => this._direction());
  readonly align = computed(() => this._align());

  /**
   * Inputs
   */
  @Input()
  set activeInput(value: string | null) {
    this._active.set(value);
  }

  @Input()
  set variantInput(value: TabsVariant) {
    this._variant.set(value ?? 'underline');
  }

  @Input()
  set directionInput(value: TabsDirection) {
    this._direction.set(value ?? 'row');
  }

  @Input()
  set alignInput(value: TabsAlign) {
    this._align.set(value ?? 'start');
  }

  /**
   * Output event for parent components.
   */
  @Output() activeChange = new EventEmitter<string>();

  /**
   * Called by ds-tab children.
   */
  setActive(id: string) {
    this._active.set(id);
    this.activeChange.emit(id);
  }

  /**
   * BEM classes
   */
  readonly classes = computed(() => {
    const base = 'ds-tabs';

    return {
      [base]: true,
      [`${base}--${this.variant()}`]: true,
      [`${base}--direction-${this.direction()}`]: true,
      [`${base}--align-${this.align()}`]: true,
    };
  });
}
