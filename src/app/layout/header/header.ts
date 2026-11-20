import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth-service';
import { UserService } from '../../auth/data-access/user-service';
import { UserResponse } from '../../auth/data-access/auth.model';
import { form, FormField, maxLength, minLength, required } from '@angular/forms/signals';
import { CampaignContextService } from '../../campaigns/data-access/campaign-context-service';
import { ROUTE_COMMANDS } from '../../app.route.segments';
import { NotificationService } from '../../shared/data-access/notification-service';


interface ProfileAvatar {
  id: string;
  name: string;
}

@Component({
  imports: [RouterLink, FormField],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header implements OnInit {
  protected readonly commands = ROUTE_COMMANDS;


  protected readonly auth = inject(AuthService);
  private readonly notifications = inject(NotificationService);
  private readonly userService = inject(UserService);
  private readonly campaignContext = inject(CampaignContextService);
  private readonly router = inject(Router);

  protected readonly avatars: ProfileAvatar[] = [
    { id: 'wizard', name: 'Mago' },
    { id: 'witch', name: 'Bruja' },
    { id: 'warlock', name: 'Brujo' },
    { id: 'assassin', name: 'Asesino' },
    { id: 'rogue', name: 'Picaro' },
    { id: 'archer', name: 'Arquero' },
    { id: 'elf', name: 'Elfa' },
    { id: 'dwarf', name: 'Enano' },
    { id: 'dwarf-king', name: 'Rey enano' },
    { id: 'priest', name: 'Sacerdote' },
    { id: 'knight', name: 'Caballero' },
    { id: 'vampire', name: 'Vampiro' },
    { id: 'orc', name: 'Orco' },
    { id: 'goblin', name: 'Goblin' },
    { id: 'kenku', name: 'Kenku' }
  ];

  private readonly user = signal<UserResponse | null>(null);

  private readonly nickname = signal('');
  protected readonly profileModel = signal({ nickname: '' });

  protected readonly profileForm = form(this.profileModel, (path) => {
    required(path.nickname, { message: 'Ingresá un nombre de usuario.' });
    minLength(path.nickname, 3, { message: 'Mínimo 3 caracteres.' });
    maxLength(path.nickname, 24, { message: 'Máximo 24 caracteres.' });
  });

  private readonly selectedAvatar = signal('wizard');
  protected readonly avatarInput = signal('wizard');

  protected readonly isEditing = signal(false);

  protected readonly displayName = computed(() =>
    this.nickname() || this.user()?.name || 'Usuario'
  );

  protected readonly avatarUrl = computed(() =>
    this.getAvatarUrl(this.selectedAvatar())
  );

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.loadUser();
    }
  }

  private loadUser() {
    this.userService.getCurrentUser().subscribe({
      next: user => {
        this.user.set(user);

        const savedName = localStorage.getItem(
          `grimoirelink:nickname:${user.publicId}`
        );

        const savedAvatar = localStorage.getItem(
          `grimoirelink:avatar:${user.publicId}`
        );

        this.nickname.set(savedName || '');

        const avatarExists = this.avatars.some(
          avatar => avatar.id === savedAvatar
        );

        this.selectedAvatar.set(
          avatarExists && savedAvatar ? savedAvatar : 'wizard'
        );
      },
      error: () => {
        this.user.set(null);
      }
    });
  }

  protected getAvatarUrl(avatarId: string) {
    return `/avatars/${avatarId}.png`;
  }

  protected openEditor() {
    this.profileModel.set({ nickname: this.displayName() });
    this.avatarInput.set(this.selectedAvatar());
    this.isEditing.set(true);
  }

  protected selectAvatar(avatarId: string) {
    const exists = this.avatars.some(
      avatar => avatar.id === avatarId
    );

    if (exists) {
      this.avatarInput.set(avatarId);
    }
  }

  protected saveProfile() {
    const name = this.profileModel().nickname.trim();
    const user = this.user();

    if (!user || name.length < 3 || name.length > 24) {
      return;
    }

    localStorage.setItem(
      `grimoirelink:nickname:${user.publicId}`,
      name
    );

    localStorage.setItem(
      `grimoirelink:avatar:${user.publicId}`,
      this.avatarInput()
    );

    this.nickname.set(name);
    this.selectedAvatar.set(this.avatarInput());
    this.isEditing.set(false);
    this.notifications.success('Perfil actualizado.');
  }

  protected cancelEditing() {
    this.isEditing.set(false);
  }

  protected logout() {
    this.auth.logout();
    this.campaignContext.reset();

    this.user.set(null);
    this.nickname.set('');
    this.selectedAvatar.set('wizard');
    this.isEditing.set(false);

    this.router.navigate(ROUTE_COMMANDS.root);
  }

}