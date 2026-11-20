import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification-service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a success message', () => {
    service.success('Guardado');

    expect(service.current()).toEqual({ message: 'Guardado', type: 'success' });
  });

  it('closes the message after 4 seconds', () => {
    service.error('Falló');

    vi.advanceTimersByTime(4000);

    expect(service.current()).toBeNull();
  });

  it('can be closed by the user', () => {
    service.success('Guardado');

    service.dismiss();

    expect(service.current()).toBeNull();
  });
});
