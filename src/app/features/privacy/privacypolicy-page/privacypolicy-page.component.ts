import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacypolicy-page',
  imports: [],
  templateUrl: './privacypolicy-page.component.html',
  styleUrl: './privacypolicy-page.component.scss',
})

export class PrivacypolicyPageComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.isLoggedIn = await this.auth.isLoggedIn();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    }
  }
}
