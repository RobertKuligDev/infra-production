import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ds-surface
 * Atomic visual primitive defining background, elevation, and contrast levels.
 * Used as the foundation for cards, overlays, panels, and containers.
 * No logic, no interactivity — pure visual element.
 */
export type SurfaceVariant = 'default' | 'subtle' | 'contrast';
export type SurfaceElevation = 0 | 1 | 2 | 3;

@Component({
  selector: 'ds-surface',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './surface.component.html',
  styleUrls: ['./surface.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurfaceComponent {
  private readonly _variant = signal<SurfaceVariant>('default');
  private readonly _elevation = signal<SurfaceElevation>(0);

  readonly variant = computed(() => this._variant());
  readonly elevation = computed(() => this._elevation());

  @Input('variant')
  set variantInput(value: SurfaceVariant) {
    this._variant.set(value ?? 'default');
  }

  @Input('elevation')
  set elevationInput(value: SurfaceElevation) {
    this._elevation.set(value ?? 0);
  }

  readonly classes = computed(() => ({
    'ds-surface': true,
    [`ds-surface--${this.variant()}`]: true,
    [`ds-surface--elevation-${this.elevation()}`]: true,
  }));
}
