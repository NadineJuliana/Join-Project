import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

function passwordMatchValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-signup-form',
  imports: [ReactiveFormsModule],
  templateUrl: './signup-form.component.html',
  styleUrl: './signup-form.component.scss',
})
export class SignupFormComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  authErrorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  isPasswordFocused = false;
  isConfirmPasswordFocused = false;

  form = this.formBuilder.nonNullable.group(
    {
      name: this.formBuilder.nonNullable.control('', [
        Validators.required,
        Validators.pattern(/^[a-zA-ZäöüÄÖÜß\s]+\s+[a-zA-ZäöüÄÖÜß\s]+$/),
        Validators.maxLength(40),
      ]),
      email: this.formBuilder.nonNullable.control('', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[a-z]{2,6}$/i),
      ]),
      password: this.formBuilder.nonNullable.control('', [Validators.required]),
      confirmPassword: this.formBuilder.nonNullable.control('', [
        Validators.required,
      ]),
      acceptPrivacy: this.formBuilder.nonNullable.control(false, [
        Validators.requiredTrue,
      ]),
    },
    { validators: [passwordMatchValidator] },
  );

  get shouldShowPasswordToggle() {
    return (
      this.isPasswordFocused || this.form.controls.password.value.length > 0
    );
  }

  get shouldShowConfirmPasswordToggle() {
    return (
      this.isConfirmPasswordFocused ||
      this.form.controls.confirmPassword.value.length > 0
    );
  }

  get shouldShowPasswordMismatchError() {
    return (
      this.form.controls.confirmPassword.touched &&
      !this.form.controls.confirmPassword.disabled &&
      this.form.hasError('passwordMismatch')
    );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onPasswordFocus() {
    this.isPasswordFocused = true;
  }

  onPasswordBlur() {
    this.isPasswordFocused = false;
  }

  onConfirmPasswordFocus() {
    this.isConfirmPasswordFocused = true;
  }

  onConfirmPasswordBlur() {
    this.isConfirmPasswordFocused = false;
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authErrorMessage = '';
    const { name, email, password } = this.form.getRawValue();
    await this.authService.signUp(name, email, password);
    this.router.navigate(['/login']);
  }
}
