import { Injectable, signal } from '@angular/core';

/**
 * ds-toast service
 * Global toast manager using Signals.
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  text: string;
  variant: ToastVariant;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  show(text: string, variant: ToastVariant = 'info', duration = 3000) {
    const id = crypto.randomUUID();

    this._toasts.update((list) => [...list, { id, text, variant, duration }]);

    setTimeout(() => this.dismiss(id), duration);
  }

  dismiss(id: string) {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
