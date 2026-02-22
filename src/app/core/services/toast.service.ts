import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  removing?: boolean; // Add this property
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toasts = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toasts.asObservable();
  private idCounter = 0;

  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 4000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 3000): void {
    this.show(message, 'warning', duration);
  }

  private show(message: string, type: Toast['type'], duration: number): void {
    const id = ++this.idCounter;
    const toast: Toast = { id, message, type, duration, removing: false };

    const current = this.toasts.value;
    this.toasts.next([...current, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: number): void {
    // Mark as removing for animation
    const current = this.toasts.value;
    const toastIndex = current.findIndex((t) => t.id === id);

    if (toastIndex !== -1) {
      current[toastIndex].removing = true;
      this.toasts.next([...current]);

      // Actually remove after animation completes
      setTimeout(() => {
        this.toasts.next(this.toasts.value.filter((t) => t.id !== id));
      }, 300); // Match animation duration
    }
  }

  clear(): void {
    this.toasts.next([]);
  }
}
