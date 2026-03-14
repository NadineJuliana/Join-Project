import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ContactsService } from '../../../contacts/services/contacts.service';

/**
 * @category Auth
 * @description Login form component handling user login and guest login.
 */
@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  /** Injected AuthService */
  private authService = inject(AuthService);

  /** Injected Router */
  private router = inject(Router);

  /** Injected ContactsService */
  private contactsService = inject(ContactsService);

  /** Injected FormBuilder */
  private formBuilder = inject(FormBuilder);

  /** Key to trigger mobile summary loader */
  private readonly mobileSummaryLoaderKey = 'showMobileSummaryLoader';

  /** Error message for authentication */
  authErrorMessage = '';

  /** Flag to show password */
  showPassword = false;

  /** Flag if password input is focused */
  isPasswordFocused = false;

  /** Reactive login form */
  form = this.formBuilder.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[a-z]{2,6}$/i),
      ],
    ],
    password: ['', [Validators.required]],
  });

  /** Should show password toggle button */
  get shouldShowPasswordToggle() {
    return (
      this.isPasswordFocused || this.form.controls.password.value.length > 0
    );
  }

  /** Toggle password visibility */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /** On password input focus */
  onPasswordFocus() {
    this.isPasswordFocused = true;
  }

  /** On password input blur */
  onPasswordBlur() {
    this.isPasswordFocused = false;
  }

  /** Handle form submission for login */
  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.authErrorMessage = '';
    const { email, password } = this.form.getRawValue();
    try {
      await this.authService.login(email, password);
      await this.contactsService.loadCurrentUserContact(email);
      sessionStorage.setItem(this.mobileSummaryLoaderKey, '1');
      this.router.navigate(['/summary']);
    } catch {
      this.authErrorMessage =
        'Check your email and password. Please try again.';
    }
  }

  /** Login as guest user */
  async loginAsGuest() {
    this.authErrorMessage = '';
    await this.authService.loginAsGuest();
    sessionStorage.setItem('showMobileSummaryLoader', '1');
    this.router.navigate(['/summary']);
  }
}
