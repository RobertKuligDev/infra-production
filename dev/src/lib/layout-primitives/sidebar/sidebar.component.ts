import { Component, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SECTION_BLOCK } from '../section-container/section-container.component';

type SidebarPosition = 'left' | 'right';
type SidebarVariant = 'default' | 'muted' | 'contrast';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule],
})
export class SidebarComponent {
  constructor(@Inject(SECTION_BLOCK) public block: string) {}

  @Input() title = '';
  @Input() width = '280px';
  @Input() sticky = false;
  @Input() position: SidebarPosition = 'right';
  @Input() variant: SidebarVariant = 'default';

  get base(): string {
    return `${this.block}__sidebar`;
  }

  get classes(): string[] {
    return [
      this.base,
      `${this.base}--${this.position}`,
      `${this.base}--${this.variant}`,
      ...(this.sticky ? [`${this.base}--sticky`] : []),
    ];
  }

  get styleVars(): Record<string, string> {
    return { '--sidebar-width': this.width };
  }
}
