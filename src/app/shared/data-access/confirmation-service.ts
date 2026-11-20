import { Service, signal } from '@angular/core';

export interface ConfirmationRequest {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
}

export type ConfirmationOptions = Partial<ConfirmationRequest> & { message: string };

// Asks the user to confirm an action; the promise resolves with the answer.
@Service()
export class ConfirmationService {
  private readonly requestState = signal<ConfirmationRequest | null>(null);
  readonly request = this.requestState.asReadonly();

  private resolveRequest: ((confirmed: boolean) => void) | null = null;

  confirm(options: ConfirmationOptions) {
    // If another confirmation was still open, it counts as cancelled.
    this.close(false);

    return new Promise<boolean>(resolve => {
      this.resolveRequest = resolve;
      this.requestState.set({
        title: options.title ?? 'Confirmar acción',
        message: options.message,
        confirmLabel: options.confirmLabel ?? 'Confirmar',
        danger: options.danger ?? false,
      });
    });
  }

  close(confirmed: boolean) {
    const resolve = this.resolveRequest;

    this.resolveRequest = null;
    this.requestState.set(null);
    resolve?.(confirmed);
  }
}
