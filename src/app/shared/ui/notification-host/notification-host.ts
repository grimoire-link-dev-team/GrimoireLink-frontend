import { Component, inject } from '@angular/core';
import { NotificationService } from '../../data-access/notification-service';

@Component({
  selector: 'app-notification-host',
  styleUrl: './notification-host.css',
  templateUrl: './notification-host.html',
})
export class NotificationHost {
  protected readonly notifications = inject(NotificationService);
}
