import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { Breadcrumbs } from '../breadcrumbs/breadcrumbs';

@Component({
  imports: [RouterOutlet,Header,Breadcrumbs,Sidebar],
  selector: 'app-main-layout',
  styleUrl: './main-layout.css',
  templateUrl: './main-layout.html',
})
export class MainLayout {
}
