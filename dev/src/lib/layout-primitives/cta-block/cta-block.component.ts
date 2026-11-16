import { Component, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SECTION_BLOCK } from '../section-container/section-container.component';

type CtaVariant = 'primary' | 'secondary' | 'subtle';
type CtaAlign = 'left' | 'center';
type CtaSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-cta-block',
  standalone: true,
  templateUrl: './cta-block.component.html',
  styleUrls: ['./cta-block.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class CtaBlockComponent {
  constructor(@Inject(SECTION_BLOCK) public block: string) {}

  @Input() title = '';
  @Input() description = '';
  @Input() buttonText = '';
  @Input() buttonLink!: string | string[];
  @Input() variant: CtaVariant = 'primary';
  @Input() align: CtaAlign = 'left';
  @Input() size: CtaSize = 'md';

  get base(): string {
    return `${this.block}__cta`;
  }

  get classes(): string[] {
    return [
      this.base,
      `${this.base}--${this.variant}`,
      `${this.base}--align-${this.align}`,
      `${this.base}--size-${this.size}`,
    ];
  }
}
