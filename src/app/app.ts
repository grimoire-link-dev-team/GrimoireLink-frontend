import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService } from './shared/data-access/confirmation-service';
import { ConfirmDialog } from './shared/ui/confirm-dialog/confirm-dialog';
import { NotificationHost } from './shared/ui/notification-host/notification-host';

@Component({
  imports: [ConfirmDialog, NotificationHost, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly confirmation = inject(ConfirmationService);
}
