import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ContactsService } from '../../../contacts/services/contacts.service';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private contactsService = inject(ContactsService);
  private formBuilder = inject(FormBuilder);
  private readonly mobileSummaryLoaderKey = 'showMobileSummaryLoader';
  authErrorMessage = '';
  showPassword = false;
  isPasswordFocused = false;

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

  get shouldShowPasswordToggle() {
    return (
      this.isPasswordFocused || this.form.controls.password.value.length > 0
    );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onPasswordFocus() {
    this.isPasswordFocused = true;
  }

  onPasswordBlur() {
    this.isPasswordFocused = false;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.authErrorMessage = '';
    const { email, password } = this.form.getRawValue();
    await this.authService.login(email, password);
    await this.contactsService.loadCurrentUserContact(email);

    sessionStorage.setItem('showMobileSummaryLoader', '1');
    this.router.navigate(['/summary']);
  }

  async loginAsGuest() {
    this.authErrorMessage = '';
    await this.authService.loginAsGuest();

    sessionStorage.setItem('showMobileSummaryLoader', '1');
    this.router.navigate(['/summary']);
  }
}
