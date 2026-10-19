import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService, RegisterData } from '../../../core/services/auth.service';

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordsMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly registerForm = this.formBuilder.nonNullable.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      age: [18, [Validators.required, Validators.min(1), Validators.max(120)]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      profilePicture: [''],
    },
    { validators: passwordsMatchValidator },
  );

  isLoading = false;
  registerError = false;
  picturePreview: string | ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== 'string') {
        return;
      }

      this.picturePreview = result;
      this.registerForm.patchValue({ profilePicture: result });
    };
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.registerForm.invalid || this.isLoading) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.registerError = false;
    const data: RegisterData = this.registerForm.getRawValue();

    this.authService.register(data).subscribe({
      next: (registered) => {
        this.isLoading = false;

        if (registered) {
          void this.router.navigate(['/login']);
          return;
        }

        this.registerError = true;
      },
      error: () => {
        this.isLoading = false;
        this.registerError = true;
      },
    });
  }

  goToLogin(): void {
    void this.router.navigate(['/login']);
  }
}
