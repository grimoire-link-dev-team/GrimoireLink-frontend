import { afterNextRender, Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { ConfirmationRequest, ConfirmationService } from '../../data-access/confirmation-service';

// The app root creates it only while there is a pending confirmation.
@Component({
  selector: 'app-confirm-dialog',
  styleUrl: './confirm-dialog.css',
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog {
  private readonly confirmation = inject(ConfirmationService);

  readonly request = input.required<ConfirmationRequest>();

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');

  constructor() {
    // showModal() blocks the rest of the page and lets Escape close the dialog.
    afterNextRender(() => this.dialogRef().nativeElement.showModal());
  }

  protected close(confirmed: boolean) {
    this.confirmation.close(confirmed);
  }

  protected onCancel(event: Event) {
    // Escape: we close it through the service so the promise is resolved.
    event.preventDefault();
    this.close(false);
  }

  protected onBackdropClick(event: MouseEvent) {
    // A click on the <dialog> itself (not on its content) is a click on the backdrop.
    if (event.target === this.dialogRef().nativeElement) {
      this.close(false);
    }
  }
}
