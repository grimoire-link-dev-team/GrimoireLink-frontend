import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, maxLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CampaignContextService } from '../../data-access/campaign-context-service';
import { CampaignService } from '../../data-access/campaign-service';
import { CampaignRequest } from '../../data-access/campaign.model';
import { ROUTE_COMMANDS } from '../../../app.route.segments';

@Component({
  imports: [FormField, FormRoot, RouterLink],
  selector: 'app-campaign-form',
  styleUrl: './campaign-form.css',
  templateUrl: './campaign-form.html',
})
export class CampaignForm {
  protected readonly commands = ROUTE_COMMANDS;

  private readonly campaignService = inject(CampaignService);
  private readonly campaignContext = inject(CampaignContextService);
  private readonly router = inject(Router);

  protected readonly errorMessage = signal('');
  protected readonly campaignModel = signal<CampaignRequest>({ name: '', description: '' });

  protected readonly campaignForm = form(
    this.campaignModel,
    (path) => {
      required(path.name, { message: 'Ingresá el nombre de la campaña.' });
      required(path.description, { message: 'Ingresá una descripción.' });
      maxLength(path.description, 65535, { message: 'La descripción es demasiado larga.' });
    },
    {
      submission: {
        action: async (field) => {
          this.errorMessage.set('');
          const { name, description } = field().value();

          const request: CampaignRequest = {
            name: name.trim(),
            description: description.trim(),
          };

          if (!request.name || !request.description) {
            this.errorMessage.set('Completá todos los campos.');
            return;
          }

          try {
            await firstValueFrom(this.campaignService.createCampaign(request));
            this.campaignContext.load();
            await this.router.navigate(ROUTE_COMMANDS.campaigns);
          } catch (error) {
            this.errorMessage.set(this.getErrorMessage(error));
          }
        },
      },
    },
  );

  private getErrorMessage(error: unknown) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'Revisá el nombre y la descripción.';
      if (error.status === 401) return 'Tu sesión no es válida. Iniciá sesión nuevamente.';
      if (error.status === 0) return 'No se pudo conectar con el servidor.';
    }
    return 'No se pudo crear la campaña.';
  }
}
