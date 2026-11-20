import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, pattern, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CampaignService } from '../../data-access/campaign-service';
import { CampaignContextService } from '../../data-access/campaign-context-service';
import { ROUTE_COMMANDS } from '../../../app.route.segments';
import { NotificationService } from '../../../shared/data-access/notification-service';

@Component({
  imports: [FormField, FormRoot, RouterLink],
  selector: 'app-campaign-join',
  styleUrl: './campaign-join.css',
  templateUrl: './campaign-join.html',
})
export class CampaignJoin {
  protected readonly commands = ROUTE_COMMANDS;

  private readonly campaignService = inject(CampaignService);
  private readonly notifications = inject(NotificationService);
  private readonly campaignContext = inject(CampaignContextService);
  private readonly router = inject(Router);

  errorMessage = signal('');
  joinModel = signal({ inviteCode: '' });

  joinForm = form(
    this.joinModel,
    (path) => {
      required(path.inviteCode, { message: 'Ingresá el código de invitación' });
      pattern(path.inviteCode, /^[0-9]{6}$/, { message: 'El código debe tener 6 dígitos' });
    },
    {
      submission: {
        action: async (field) => {
          this.errorMessage.set('');
          const inviteCode = field().value().inviteCode.trim();

          try {
            const campaign = await firstValueFrom(this.campaignService.joinCampaign(inviteCode));
            this.campaignContext.load(campaign.publicId);
            this.notifications.success(`Te uniste a "${campaign.name}".`);
            await this.router.navigate(ROUTE_COMMANDS.campaignDetail(campaign.publicId));
          } catch (error) {
            this.errorMessage.set(this.getErrorMessage(error));
          }
        },
      },
    },
  );

  private getErrorMessage(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'El código ingresado no es válido.';
      if (error.status === 404) return 'No hay ninguna campaña con ese código.';
      if (error.status === 409) return 'Ya sos parte de esta campaña.';
      if (error.status === 0) return 'No se pudo conectar con el servidor.';
    }
    return 'No se pudo unir a la campaña. Intentá de nuevo.';
  }
}