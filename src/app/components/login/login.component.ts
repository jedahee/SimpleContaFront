import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../notification/notification.component';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, NotificationComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private errorService: ErrorService
  ) {

    if (typeof window === 'undefined')
      this.router.navigate(['https://google.com'])

    this.loginForm = this.fb.group({
      password: ['', Validators.required],
    });

    this.errorService.clearErrorMessage();
  }


  onSubmit(): void {

    if (this.loginForm.valid) {
      const { password } = this.loginForm.value;

      this.authService.login(password).subscribe({
        next: () => {
          this.router.navigate(['/home']); // Redirige a la página principal
        },
        error: (error) => {
          const message = this.errorService.getErrorMessage(error.status, error.message);
          this.errorService.setErrorMessage(message);
        },
        complete: () => {
        }
      });
    }
  }

}
