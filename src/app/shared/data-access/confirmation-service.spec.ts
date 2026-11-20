import { TestBed } from '@angular/core/testing';
import { ConfirmationService } from './confirmation-service';

describe('ConfirmationService', () => {
  let service: ConfirmationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfirmationService);
  });

  it('opens a request with default values', () => {
    service.confirm({ message: '¿Seguro?' });

    expect(service.request()).toEqual({
      title: 'Confirmar acción',
      message: '¿Seguro?',
      confirmLabel: 'Confirmar',
      danger: false,
    });
  });

  it('resolves with the user answer and closes the request', async () => {
    const answer = service.confirm({ message: '¿Seguro?' });

    service.close(true);

    expect(await answer).toBe(true);
    expect(service.request()).toBeNull();
  });

  it('cancels the previous request when a new one is opened', async () => {
    const first = service.confirm({ message: 'Primera' });
    service.confirm({ message: 'Segunda' });

    expect(await first).toBe(false);
    expect(service.request()?.message).toBe('Segunda');
  });
});
