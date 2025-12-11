import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected registerForm!: FormGroup;
  protected isLoading = false;
  protected hidePassword = true;
  protected hideConfirmPassword = true;
  protected nameFocused = false;
  protected emailFocused = false;
  protected passwordFocused = false;
  protected confirmPasswordFocused = false;

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        agreeToTerms: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator }
    );

    // Redirect if already logged in
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  protected get passwordStrength(): number {
    const pwd = this.password?.value || '';
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  }

  protected get passwordStrengthText(): string {
    switch (this.passwordStrength) {
      case 0:
        return '';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  }

  protected get hasMinLength(): boolean {
    return (this.password?.value || '').length >= 8;
  }

  protected get hasUppercase(): boolean {
    return /[A-Z]/.test(this.password?.value || '');
  }

  protected get hasNumber(): boolean {
    return /[0-9]/.test(this.password?.value || '');
  }

  passwordMatchValidator(
    control: AbstractControl
  ): Record<string, boolean> | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  protected onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const { name, email, password } = this.registerForm.value;

    this.authService.register({ name, email, password }).subscribe({
      next: () => {
        this.snackBar.open('Account created successfully!', 'Close', {
          duration: 3000,
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        const message =
          error.error?.message || 'Registration failed. Please try again.';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }

  protected get name() {
    return this.registerForm.get('name');
  }

  protected get email() {
    return this.registerForm.get('email');
  }

  protected get password() {
    return this.registerForm.get('password');
  }

  protected get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
