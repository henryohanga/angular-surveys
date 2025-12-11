import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  protected loginForm!: FormGroup;
  protected isLoading = false;
  protected hidePassword = true;
  protected returnUrl = '/dashboard';
  protected emailFocused = false;
  protected passwordFocused = false;

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false],
    });

    // Get return URL from route parameters
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    // Redirect if already logged in
    if (this.authService.isAuthenticated) {
      this.router.navigate([this.returnUrl]);
    }
  }

  protected onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.snackBar.open('Welcome back!', 'Close', { duration: 3000 });
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.isLoading = false;
        const message = error.error?.message || 'Invalid email or password';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }

  protected get email() {
    return this.loginForm.get('email');
  }

  protected get password() {
    return this.loginForm.get('password');
  }
}
