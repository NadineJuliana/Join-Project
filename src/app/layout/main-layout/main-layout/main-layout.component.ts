import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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
export class MainLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private contactsService = inject(ContactsService);
  private router = inject(Router);

  constructor() {
    this.loadCurrentUser();
    // this.autoLogoutIfLoggedIn();
  }

  private async loadCurrentUser() {
    const user = await this.authService.getUser();
    if (user?.email && !localStorage.getItem('guest')) {
      await this.contactsService.loadCurrentUserContact(user.email);
    }
  }

  async ngOnInit() {
    const loggedIn = await this.authService.isLoggedIn();
    if (!loggedIn) {
      await this.authService.logout();
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  // private async autoLogoutIfLoggedIn() {
  //   const user = await this.authService.getUser();
  //   const isGuest = !!localStorage.getItem('guest');
  //   if (user || isGuest) {
  //     await this.authService.logout();
  //   }
  // }
}
