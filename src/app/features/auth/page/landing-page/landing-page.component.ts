import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { SignupFormComponent } from '../../components/signup-form/signup-form.component';

@Component({
  selector: 'app-landing-page',
  imports: [LoginFormComponent, SignupFormComponent, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  constructor(private readonly router: Router) {}

  get showSignupForm() {
    return this.router.url.startsWith('/signup');
  }

  openSignupForm() {
    this.router.navigate(['/signup']);
  }
}
