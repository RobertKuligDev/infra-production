import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * ds-kbd
 * Visual primitive for keyboard key hints.
 * Used in shortcuts, command palettes, and help UIs.
 */
@Component({
  selector: 'ds-kbd',
  standalone: true,
  templateUrl: './kbd.component.html',
  styleUrls: ['./kbd.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbdComponent {}
