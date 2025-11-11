import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-iam-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.css']
})
export class IamRegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  currentStep = 1;
  totalSteps = 2;

  constructor() {
    this.registerForm = this.fb.group({
      // Step 1: Business Information
      businessName: ['', [Validators.required, Validators.minLength(3)]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{9,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      taxId: ['', [Validators.required]],

      // Step 2: Parking Configuration
      maxCapacity: [50, [Validators.required, Validators.min(1)]],
      motorcycleRate: [2, [Validators.required, Validators.min(0)]],
      carTruckRate: [4, [Validators.required, Validators.min(0)]],
      nightRate: [20, [Validators.required, Validators.min(0)]],
      openingTime: ['08:00', [Validators.required]],
      closingTime: ['22:00', [Validators.required]],
      currency: ['PEN', [Validators.required]],

      // Admin Account
      adminName: ['', [Validators.required, Validators.minLength(3)]],
      adminUsername: ['', [Validators.required, Validators.minLength(4)]],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      const step1Fields = ['businessName', 'address', 'phone', 'email', 'taxId'];
      const step1Valid = step1Fields.every(field => this.registerForm.get(field)?.valid);

      if (!step1Valid) {
        step1Fields.forEach(field => this.registerForm.get(field)?.markAsTouched());
        return;
      }
      this.currentStep = 2;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `¡Cuenta creada exitosamente! Bienvenido ${response.businessName || this.registerForm.value.businessName}. Redirigiendo al panel principal...`;

        // Hacer scroll al mensaje de éxito
        setTimeout(() => {
          const successAlert = document.querySelector('.success-alert');
          if (successAlert) {
            successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);

        // Redirigir al dashboard después de 2.5 segundos
        setTimeout(() => {
          this.router.navigate(['/monitoring/dashboard']);
        }, 2500);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al registrar:', error);

        // Mensajes de error más específicos
        if (error.status === 0) {
          this.errorMessage = 'No se puede conectar al servidor. Por favor, verifica que el servidor esté en ejecución en http://localhost:3000';
        } else if (error.status === 404) {
          this.errorMessage = 'El endpoint de registro no fue encontrado. Verifica la configuración del servidor.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Error al crear la cuenta. Por favor, intenta nuevamente.';
        }

        // Hacer scroll al mensaje de error
        setTimeout(() => {
          const errorAlert = document.querySelector('.error-alert');
          if (errorAlert) {
            errorAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFormControl(name: string) {
    return this.registerForm.get(name);
  }
}
