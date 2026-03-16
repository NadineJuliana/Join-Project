import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { ToastsService } from '../../../../core/services/toasts.service';
import { Contact } from '../../../contacts/models/contact.model';

/**
 * @category Auth Form
 * @description Signup form component handling user registration and validation.
 */

/**
 * Validates that password and confirmPassword fields match.
 * Returns a ValidationErrors object if they don't match.
 */
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
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup-form.component.html',
  styleUrl: './signup-form.component.scss',
})
export class SignupFormComponent {
  /** Injected AuthService */
  private authService = inject(AuthService);

  /** Injected Router */
  private router = inject(Router);

  /** Injected FormBuilder */
  private formBuilder = inject(FormBuilder);

  /** Injected ToastsService */
  private toastService = inject(ToastsService);

  /** Authentication error message */
  authErrorMessage = '';

  /** Flags for showing/hiding passwords */
  showPassword = false;
  showConfirmPassword = false;

  /** Flags for password input focus */
  isPasswordFocused = false;
  isConfirmPasswordFocused = false;

  /** Reactive signup form */
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
      password: this.formBuilder.nonNullable.control('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: this.formBuilder.nonNullable.control('', [
        Validators.required,
      ]),
      acceptPrivacy: this.formBuilder.nonNullable.control(false, [
        Validators.requiredTrue,
      ]),
    },
    { validators: [passwordMatchValidator] },
  );

  /** Show password toggle for main password */
  get shouldShowPasswordToggle() {
    return (
      this.isPasswordFocused || this.form.controls.password.value.length > 0
    );
  }

  /** Show password toggle for confirm password */
  get shouldShowConfirmPasswordToggle() {
    return (
      this.isConfirmPasswordFocused ||
      this.form.controls.confirmPassword.value.length > 0
    );
  }

  /** Show password mismatch error */
  get shouldShowPasswordMismatchError() {
    return (
      this.form.controls.confirmPassword.touched &&
      !this.form.controls.confirmPassword.disabled &&
      this.form.hasError('passwordMismatch')
    );
  }

  /** Toggle password visibility */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /** Toggle confirm password visibility */
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /** Focus/blur handlers */
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

  /** Format name input value */
  formatNameField() {
    const control = this.form.controls.name;
    control.setValue(new Contact({ name: control.value }).name, {
      emitEvent: false,
    });
  }

  /** Format email input value */
  formatEmailField() {
    const control = this.form.controls.email;
    control.setValue(control.value.trim().toLowerCase(), {
      emitEvent: false,
    });
  }

  /** Handle form submission for signup */
  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.authErrorMessage = '';
    const { name, email, password } = this.form.getRawValue();
    const result = await this.authService.signUp(name, email, password);
    if (result.error) {
      const message = result.error.message.toLowerCase();
      if (message.includes('already registered') || message.includes('422')) {
        this.authErrorMessage = 'This user is already registered';
      } else {
        this.authErrorMessage = 'Please try again.';
      }
      return;
    }
    await this.authService.logout();
    this.createToastMessage();
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 500);
  }

  /** Show signup success toast */
  private createToastMessage() {
    this.toastService.showToast({
      message: 'You Signed Up successfully',
      classname: 'toast__success',
      position: 'center',
      duration: 1000,
    });
  }
}
