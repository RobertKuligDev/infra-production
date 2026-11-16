import { Component, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SECTION_BLOCK } from '../section-container/section-container.component';

type ContentAlign = 'left' | 'center';
type ContentWidth = 'narrow' | 'base' | 'wide';
type ContentVariant = 'default' | 'subtle' | 'contrast';

@Component({
  selector: 'app-content-block',
  standalone: true,
  templateUrl: './content-block.component.html',
  styleUrls: ['./content-block.component.scss'],
  imports: [CommonModule],
})
export class ContentBlockComponent {
  constructor(@Inject(SECTION_BLOCK) public block: string) {}

  @Input() align: ContentAlign = 'left';
  @Input() width: ContentWidth = 'base';
  @Input() variant: ContentVariant = 'default';

  get base(): string {
    return `${this.block}__content`;
  }

  get classes(): string[] {
    return [
      this.base,
      `${this.base}--align-${this.align}`,
      `${this.base}--width-${this.width}`,
      `${this.base}--${this.variant}`,
    ];
  }
}
