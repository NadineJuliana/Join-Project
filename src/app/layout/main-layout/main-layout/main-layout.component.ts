import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../../features/auth/services/auth.service';
import { ContactsService } from '../../../features/contacts/services/contacts.service';

/**
 * @category Layout
 * @description Main layout component combining header, sidebar, and router outlet.
 */
  @Component({
    selector: 'app-main-layout',
    standalone: true,
    imports: [RouterOutlet, SidebarComponent, HeaderComponent],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss',
  })
  export class MainLayoutComponent {
    /** Injected AuthService */
      private authService = inject(AuthService);

    /** Injected ContactsService */
      private contactsService = inject(ContactsService);

    /** Initialize component and load current user contact if not guest */
      constructor() {
        this.loadCurrentUser();
      }

    /** Load current user contact from AuthService and ContactsService */
      private async loadCurrentUser() {
        const user = await this.authService.getUser();
        if (user?.email && !localStorage.getItem('guest')) {
          await this.contactsService.loadCurrentUserContact(user.email);
        }
      }
  }
