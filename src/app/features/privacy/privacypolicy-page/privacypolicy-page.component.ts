import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

/**
 * @category Pages
 * @description Privacy policy page displaying information about data protection.
 */
@Component({
  selector: 'app-privacypolicy-page',
  imports: [],
  templateUrl: './privacypolicy-page.component.html',
  styleUrl: './privacypolicy-page.component.scss',
})
export class PrivacypolicyPageComponent {
  /** Indicates whether the user is logged in */
  isLoggedIn = false;

  /** Authentication service.
   * Angular router.
   * Location service for navigation.
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location,
  ) {}

  /** Initialize component and check login status */
  async ngOnInit() {
    this.isLoggedIn = await this.authService.isLoggedIn();
  }

  /** Navigate back or fallback to summary page */
  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/summary']);
    }
  }
}
