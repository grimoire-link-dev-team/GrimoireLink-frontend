import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { ROUTE_COMMANDS, ROUTE_SEGMENTS } from '../../app.route.segments';

// Page name for the first segment of the URL.
const PAGE_LABELS: Record<string, string> = {
  [ROUTE_SEGMENTS.home]: 'Inicio',
  [ROUTE_SEGMENTS.characters]: 'Personajes',
  [ROUTE_SEGMENTS.campaigns]: 'Campañas',
  [ROUTE_SEGMENTS.journal]: 'Diario',
  [ROUTE_SEGMENTS.monsters]: 'Monstruos',
  [ROUTE_SEGMENTS.dice]: 'Dados',
  [ROUTE_SEGMENTS.encounters]: 'Encuentros',
};

@Component({
  imports: [RouterLink],
  selector: 'app-breadcrumbs',
  styleUrl: './breadcrumbs.css',
  templateUrl: './breadcrumbs.html',
})
export class Breadcrumbs {
  private readonly router = inject(Router);

  protected readonly commands = ROUTE_COMMANDS;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly currentPage = computed(() => {
    const firstSegment = this.url().split(/[?#]/)[0].split('/')[1] ?? '';
    return PAGE_LABELS[firstSegment] ?? 'Inicio';
  });
}
