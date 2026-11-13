import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  imports: [RouterLink],
  selector: 'app-breadcrumbs',
  styleUrl: './breadcrumbs.css',
  templateUrl: './breadcrumbs.html',
})
export class Breadcrumbs implements OnInit,OnDestroy{
  currentPage: string = 'Inicio';
  private routerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateCurrentPage();

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateCurrentPage());
  }

  private updateCurrentPage(): void {
    const currentRoute = this.router.url.split('?')[0].split('#')[0];

    const pages: Record<string, string> = {
      '/': 'Inicio',
      '/inicio': 'Inicio',
      '/personajes': 'Personajes',
      '/campañas': 'Campañas',
      '/diario': 'Diario',
      '/monstruos': 'Monstruos',
      '/encuentros': 'Encuentros'
    };

    this.currentPage = pages[currentRoute] || 'Inicio';
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}
