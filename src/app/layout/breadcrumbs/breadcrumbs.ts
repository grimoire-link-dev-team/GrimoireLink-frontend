import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  imports: [RouterLink],
  selector: 'app-breadcrumbs',
  styleUrl: './breadcrumbs.css',
  templateUrl: './breadcrumbs.html',
})
export class Breadcrumbs {
  paginaActual="Inicio";

  constructor(private router:Router)
  {
    this.actualizarPagina();
    this.router.events
    .pipe(filter((evento)=>evento instanceof NavigationEnd))
    .subscribe(()=> this.actualizarPagina());
  }

  private actualizarPagina():void
  {
    const ruta=this.router.url.split('?')[0].split('#')[0];
    const pagina:{[ruta:string]:string}={
      '/': 'Inicio',
      '/inicio': 'Inicio',
      '/personajes': 'Personajes',
      '/campanias': 'Campañas',
      '/diario': 'Diario',
      '/monstruos': 'Monstruos',
      '/encuentros': 'Encuentros',
    }
    this.paginaActual=pagina[ruta] || 'Inicio';
  }
}
