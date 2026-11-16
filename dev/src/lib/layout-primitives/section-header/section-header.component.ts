import { CommonModule } from '@angular/common';
import { Component, Inject, InjectionToken, Input } from '@angular/core';

export const SECTION_BLOCK = new InjectionToken<string>('SECTION_BLOCK');

@Component({
  selector: 'app-section-header',
  standalone: true,
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss'],
  imports: [CommonModule],
})
export class SectionHeaderComponent {
  constructor(@Inject(SECTION_BLOCK) public block: string) {}

  @Input() label = '';
  @Input() title = '';
  @Input() description = '';
  @Input() align: 'left' | 'center' = 'left';
  @Input() level: 'h1' | 'h2' | 'h3' = 'h2';
  @Input() icon?: string;
  @Input() showLabel = true;
  @Input() showDescription = true;

  get base(): string {
    return `${this.block}__header`;
  }
}
