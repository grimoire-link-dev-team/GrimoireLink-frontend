import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

type ViewMode='Dungeon Master'| 'Player';
@Component({
  imports: [RouterLink,RouterLinkActive,FormsModule],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit{

  selectedView: ViewMode = 'Dungeon Master';

  ngOnInit(): void {
    this.selectedView = 'Dungeon Master';
  }

  isDungeonMaster(): boolean {
    return this.selectedView === 'Dungeon Master';
  }

}
