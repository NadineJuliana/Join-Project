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
  skipIntro = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit() {
    this.skipIntro = this.authService.landingIntroPlayed;
    this.authService.landingIntroPlayed = true;
  }

  get showSignupForm() {
    return this.router.url.startsWith('/signup');
  }

  openSignupForm() {
    this.router.navigate(['/signup']);
  }
}
