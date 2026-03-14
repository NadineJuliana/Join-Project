import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

/**
 * @category Layout
 * @description Sidebar component displaying navigation links and login state.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NavbarComponent, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  /** Injected AuthService */
  private authService = inject(AuthService);

  /** Flag if user is logged in */
  isLoggedIn = false;

  /** Initialize component and check login status */
  async ngOnInit() {
    this.isLoggedIn = await this.authService.isLoggedIn();
  }
}
