import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ElementRef,
  HostListener,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-tooltip
 * Minimal, accessible tooltip with hover/focus trigger,
 * ARIA support, and directional positioning.
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

@Component({
  selector: 'ds-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  private readonly _text = signal<string>('');
  private readonly _position = signal<TooltipPosition>('top');
  private readonly _open = signal<boolean>(false);

  readonly text = computed(() => this._text());
  readonly position = computed(() => this._position());
  readonly open = computed(() => this._open());

  @Input()
  set textInput(value: string) {
    this._text.set(value);
  }

  @Input()
  set positionInput(value: TooltipPosition) {
    this._position.set(value ?? 'top');
  }

  @HostListener('mouseenter')
  @HostListener('focusin')
  show() {
    this._open.set(true);
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  hide() {
    this._open.set(false);
  }

  readonly classes = computed(() => ({
    'ds-tooltip': true,
    [`ds-tooltip--${this.position()}`]: true,
    'ds-tooltip--open': this.open(),
  }));
}
