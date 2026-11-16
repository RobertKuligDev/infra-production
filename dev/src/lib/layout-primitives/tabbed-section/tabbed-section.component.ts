import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SECTION_BLOCK } from '../section-container/section-container.component';

export interface TabItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-tabbed-section',
  standalone: true,
  templateUrl: './tabbed-section.component.html',
  styleUrls: ['./tabbed-section.component.scss'],
  imports: [CommonModule],
})
export class TabbedSectionComponent {
  constructor(@Inject(SECTION_BLOCK) public block: string) {}

  @Input() tabs: TabItem[] = [];
  @Input() selected?: string;
  @Output() selectedChange = new EventEmitter<string>();

  get base(): string {
    return `${this.block}__tabs`;
  }

  onSelect(tabId: string): void {
    this.selected = tabId;
    this.selectedChange.emit(tabId);
  }
}
