import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationService } from '../../data-access/notification-service';
import { NotificationHost } from './notification-host';

describe('NotificationHost', () => {
  let fixture: ComponentFixture<NotificationHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationHost],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationHost);
    await fixture.whenStable();
  });

  it('renders the current notification', async () => {
    TestBed.inject(NotificationService).success('Campaña creada.');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.notification')?.textContent).toContain('Campaña creada.');
  });
});
