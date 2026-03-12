import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ContactsService } from '../../../features/contacts/services/contacts.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private contactsService = inject(ContactsService);

  constructor() {
    this.loadCurrentUser();
  }

  private async loadCurrentUser() {
    const user = await this.authService.getUser();
    if (user?.email && !localStorage.getItem('guest')) {
      await this.contactsService.loadCurrentUserContact(user.email);
    }
  }
}
