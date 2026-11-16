import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from '../tabs/tabs.component';

/**
 * Tab Panel UI Control.
 * Represents the content associated with a ds-tab.
 * Visibility is controlled by the parent ds-tabs active state.
 */

@Component({
  selector: 'ds-tab-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-panel.component.html',
  styleUrls: ['./tab-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabPanelComponent {
  private readonly tabs = inject(TabsComponent);

  private readonly _id = signal<string>('');

  readonly id = computed(() => this._id());
  readonly isActive = computed(() => this.tabs.active() === this.id());

  @Input()
  set idInput(value: string) {
    this._id.set(value);
  }

  readonly classes = computed(() => ({
    'ds-tab-panel': true,
    'ds-tab-panel--active': this.isActive(),
  }));
}
