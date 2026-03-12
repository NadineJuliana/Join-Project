import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { SignupFormComponent } from '../../components/signup-form/signup-form.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing-page',
  imports: [LoginFormComponent, SignupFormComponent, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private authService: AuthService,
  ) {}

  async ngOnInit() {
    await this.authService.logout();
    history.pushState(null, '', location.href);
    window.onpopstate = () => {
      history.go(1);
    };
  }

  get showSignupForm() {
    return this.router.url.startsWith('/signup');
  }

  openSignupForm() {
    this.router.navigate(['/signup']);
  }
}
