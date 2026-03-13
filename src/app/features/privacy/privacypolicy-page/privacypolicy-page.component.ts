import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-privacypolicy-page',
  imports: [],
  templateUrl: './privacypolicy-page.component.html',
  styleUrl: './privacypolicy-page.component.scss',
})
export class PrivacypolicyPageComponent {
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private location: Location,
  ) {}

  async ngOnInit() {
    this.isLoggedIn = await this.authService.isLoggedIn();
  }

  goBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/summary']);
    }
  }
}
