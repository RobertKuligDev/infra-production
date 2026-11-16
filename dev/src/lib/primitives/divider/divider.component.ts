import { Component, ChangeDetectionStrategy } from '@angular/core';

/**
 * ds-divider
 * Visual primitive used to separate content blocks.
 * Purely decorative, no logic or interactivity.
 */
@Component({
  selector: 'ds-divider',
  standalone: true,
  templateUrl: './divider.component.html',
  styleUrls: ['./divider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerComponent {}
