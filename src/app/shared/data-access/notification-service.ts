import { Service, signal } from '@angular/core';

export type NotificationType = 'success' | 'error';

export interface AppNotification {
  message: string;
  type: NotificationType;
}

// Global toast: one message at a time, closes itself after a few seconds.
@Service()
export class NotificationService {
  private readonly currentState = signal<AppNotification | null>(null);
  readonly current = this.currentState.asReadonly();

  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  success(message: string) {
    this.show({ message, type: 'success' });
  }

  error(message: string) {
    this.show({ message, type: 'error' });
  }

  dismiss() {
    clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
    this.currentState.set(null);
  }

  private show(notification: AppNotification) {
    clearTimeout(this.timeoutId);
    this.currentState.set(notification);
    this.timeoutId = setTimeout(() => this.dismiss(), 4000);
  }
}
