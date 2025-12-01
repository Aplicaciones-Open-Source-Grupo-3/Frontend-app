const fs = require('fs');
const path = require('path');

// Template del archivo HTML del registro con el mensaje de éxito incluido
const htmlContent = `<div class="register-container">
  <div class="register-card">
    <div class="register-header">
      <div class="logo-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h1>{{ 'IAM.REGISTER.TITLE' | translate }}</h1>
      <p class="subtitle">{{ 'IAM.REGISTER.SUBTITLE' | translate }}</p>
    </div>

    <!-- Progress Steps -->
    <div class="progress-steps">
      <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
        <div class="step-number">1</div>
        <div class="step-label">{{ 'IAM.REGISTER.STEP1_TITLE' | translate }}</div>
      </div>
      <div class="step-connector" [class.completed]="currentStep > 1"></div>
      <div class="step" [class.active]="currentStep >= 2">
        <div class="step-number">2</div>
        <div class="step-label">{{ 'IAM.REGISTER.STEP2_TITLE' | translate }}</div>
      </div>
    </div>

    <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">

      <!-- Step 1: Business Information -->
      <div class="form-step" *ngIf="currentStep === 1">
        <h3 class="step-title">{{ 'IAM.REGISTER.BUSINESS_INFO' | translate }}</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="businessName">{{ 'IAM.REGISTER.BUSINESS_NAME' | translate }} *</label>
            <input
              id="businessName"
              type="text"
              formControlName="businessName"
              [placeholder]="'IAM.REGISTER.BUSINESS_NAME_PLACEHOLDER' | translate"
              [class.invalid]="getFormControl('businessName')?.invalid && getFormControl('businessName')?.touched"
            />
            <span class="error-message" *ngIf="getFormControl('businessName')?.invalid && getFormControl('businessName')?.touched">
              {{ 'IAM.REGISTER.BUSINESS_NAME_REQUIRED' | translate }}
            </span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="address">{{ 'IAM.REGISTER.ADDRESS' | translate }} *</label>
            <input
              id="address"
              type="text"
              formControlName="address"
              [placeholder]="'IAM.REGISTER.ADDRESS_PLACEHOLDER' | translate"
              [class.invalid]="getFormControl('address')?.invalid && getFormControl('address')?.touched"
            />
            <span class="error-message" *ngIf="getFormControl('address')?.invalid && getFormControl('address')?.touched">
              {{ 'IAM.REGISTER.ADDRESS_REQUIRED' | translate }}
            </span>
          </div>
        </div>

        <div class="form-row two-cols">
          <div class="form-group">
            <label for="phone">{{ 'IAM.REGISTER.PHONE' | translate }} *</label>
            <input
              id="phone"
              type="tel"
              formControlName="phone"
              [placeholder]="'IAM.REGISTER.PHONE_PLACEHOLDER' | translate"
              [class.invalid]="getFormControl('phone')?.invalid && getFormControl('phone')?.touched"
            />
            <span class="error-message" *ngIf="getFormControl('phone')?.invalid && getFormControl('phone')?.touched">
              {{ 'IAM.REGISTER.PHONE_INVALID' | translate }}
            </span>
          </div>

          <div class="form-group">
            <label for="taxId">{{ 'IAM.REGISTER.TAX_ID' | translate }} *</label>
            <input
              id="taxId"
              type="text"
              formControlName="taxId"
              [placeholder]="'IAM.REGISTER.TAX_ID_PLACEHOLDER' | translate"
              [class.invalid]="getFormControl('taxId')?.invalid && getFormControl('taxId')?.touched"
            />
            <span class="error-message" *ngIf="getFormControl('taxId')?.invalid && getFormControl('taxId')?.touched">
              {{ 'IAM.REGISTER.TAX_ID_REQUIRED' | translate }}
            </span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="email">{{ 'IAM.REGISTER.EMAIL' | translate }} *</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              [placeholder]="'IAM.REGISTER.EMAIL_PLACEHOLDER' | translate"
              [class.invalid]="getFormControl('email')?.invalid && getFormControl('email')?.touched"
            />
            <span class="error-message" *ngIf="getFormControl('email')?.invalid && getFormControl('email')?.touched">
              {{ 'IAM.REGISTER.EMAIL_INVALID' | translate }}
            </span>
          </div>
        </div>

        <button type="button" class="next-button" (click)="nextStep()">
          {{ 'IAM.REGISTER.NEXT' | translate }}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Step 2: Configuration & Admin Account -->
      <div class="form-step" *ngIf="currentStep === 2">
        <h3 class="step-title">{{ 'IAM.REGISTER.PARKING_CONFIG' | translate }}</h3>

        <div class="form-row three-cols">
          <div class="form-group">
            <label for="maxCapacity">{{ 'IAM.REGISTER.MAX_CAPACITY' | translate }} *</label>
            <input
              id="maxCapacity"
              type="number"
              formControlName="maxCapacity"
              min="1"
              [class.invalid]="getFormControl('maxCapacity')?.invalid && getFormControl('maxCapacity')?.touched"
            />
          </div>

          <div class="form-group">
            <label for="motorcycleRate">{{ 'IAM.REGISTER.MOTORCYCLE_RATE' | translate }} *</label>
            <input
              id="motorcycleRate"
              type="number"
              formControlName="motorcycleRate"
              min="0"
              step="0.5"
              [class.invalid]="getFormControl('motorcycleRate')?.invalid && getFormControl('motorcycleRate')?.touched"
            />
          </div>

          <div class="form-group">
            <label for="carTruckRate">{{ 'IAM.REGISTER.CAR_RATE' | translate }} *</label>
            <input
              id="carTruckRate"
              type="number"
              formControlName="carTruckRate"
              min="0"
              step="0.5"
              [class.invalid]="getFormControl('carTruckRate')?.invalid && getFormControl('carTruckRate')?.touched"
            />
          </div>
        </div>

        <div class="form-row three-cols">
          <div class="form-group">
            <label for="nightRate">{{ 'IAM.REGISTER.NIGHT_RATE' | translate }} *</label>
            <input
              id="nightRate"
              type="number"
              formControlName="nightRate"
              min="0"
              step="1"
              [class.invalid]="getFormControl('nightRate')?.invalid && getFormControl('nightRate')?.touched"
            />
          </div>

          <div class="form-group">
            <label for="openingTime">{{ 'IAM.REGISTER.OPENING_TIME' | translate }} *</label>
            <input
              id="openingTime"
              type="time"
              formControlName="openingTime"
              [class.invalid]="getFormControl('openingTime')?.invalid && getFormControl('openingTime')?.touched"
            />
          </div>

          <div class="form-group">
            <label for="closingTime">{{ 'IAM.REGISTER.CLOSING_TIME' | translate }} *</label>
            <input
              id="closingTime"
              type="time"
              formControlName="closingTime"
              [class.invalid]="getFormControl('closingTime')?.invalid && getFormControl('closingTime')?.touched"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="currency">{{ 'IAM.REGISTER.CURRENCY' | translate }} *</label>
            <select id="currency" formControlName="currency">
              <option value="PEN">PEN - Soles Peruanos</option>
              <option value="USD">USD - Dólares</option>
              <option value="EUR">EUR - Euros</option>
            </select>
          </div>
        </div>

        <h3 class="step-title" style="margin-top: 2rem;">{{ 'IAM.REGISTER.ADMIN_ACCOUNT' | translate }}</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="adminName">{{ 'IAM.REGISTER.ADMIN_NAME' | translate }} *</label>
            <input
              id="adminName"
              type="text"
              formControlName="adminName"
              [placeholder]="'IAM.REGISTER.ADMIN_NAME_PLACEHOLDER' | translate"
              [class.invalid]="getFormControl('adminName')?.invalid && getFormControl('adminName')?.touched"
            />
            <span class="error-message" *ngIf="getFormControl('adminName')?.invalid && getFormControl('adminName')?.touched">
              {{ 'IAM.REGISTER.ADMIN_NAME_REQUIRED' | translate }}
            </span>
          </div>
        </div>

        <div class="form-row two-cols">
          <div class="form-group">
            <label for="adminUsername">{{ 'IAM.REGISTER.ADMIN_USERNAME' | translate }} *</label>
            <input
              id="adminUsername"
              type="text"
              formControlName="adminUsername"
              [placeholder]="'IAM.REGISTER.ADMIN_USERNAME_PLACEHOLDER' | translate"
              [class.invalid]="getFormControl('adminUsername')?.invalid && getFormControl('adminUsername')?.touched"
            />
            <span class="error-message" *ngIf="getFormControl('adminUsername')?.invalid && getFormControl('adminUsername')?.touched">
              {{ 'IAM.REGISTER.ADMIN_USERNAME_REQUIRED' | translate }}
            </span>
          </div>

          <div class="form-group">
            <label for="adminEmail">{{ 'IAM.REGISTER.ADMIN_EMAIL' | translate }} *</label>
            <input
              id="adminEmail"
              type="email"
              formControlName="adminEmail"
              [placeholder]="'IAM.REGISTER.ADMIN_EMAIL_PLACEHOLDER' | translate"
              [class.invalid]="getFormControl('adminEmail')?.invalid && getFormControl('adminEmail')?.touched"
            />
            <span class="error-message" *ngIf="getFormControl('adminEmail')?.invalid && getFormControl('adminEmail')?.touched">
              {{ 'IAM.REGISTER.ADMIN_EMAIL_INVALID' | translate }}
            </span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="adminPassword">{{ 'IAM.REGISTER.ADMIN_PASSWORD' | translate }} *</label>
            <div class="input-wrapper">
              <input
                id="adminPassword"
                [type]="showPassword ? 'text' : 'password'"
                formControlName="adminPassword"
                [placeholder]="'IAM.REGISTER.ADMIN_PASSWORD_PLACEHOLDER' | translate"
                [class.invalid]="getFormControl('adminPassword')?.invalid && getFormControl('adminPassword')?.touched"
              />
              <button type="button" class="toggle-password" (click)="togglePasswordVisibility()">
                <svg *ngIf="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg *ngIf="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
            <span class="error-message" *ngIf="getFormControl('adminPassword')?.invalid && getFormControl('adminPassword')?.touched">
              {{ 'IAM.REGISTER.ADMIN_PASSWORD_REQUIRED' | translate }}
            </span>
          </div>
        </div>

        <div class="error-alert" *ngIf="errorMessage">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <div class="success-alert" *ngIf="successMessage">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>{{ successMessage }}</span>
        </div>

        <div class="form-actions">
          <button type="button" class="back-button" (click)="previousStep()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            {{ 'IAM.REGISTER.BACK' | translate }}
          </button>

          <button type="submit" class="submit-button" [disabled]="isLoading">
            <span *ngIf="!isLoading">{{ 'IAM.REGISTER.CREATE_ACCOUNT' | translate }}</span>
            <span *ngIf="isLoading" class="loading-spinner">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
              {{ 'IAM.REGISTER.CREATING' | translate }}
            </span>
          </button>
        </div>
      </div>
    </form>

    <div class="register-footer">
      <p>{{ 'IAM.REGISTER.HAVE_ACCOUNT' | translate }}</p>
      <a routerLink="/iam/login" class="login-link">{{ 'IAM.REGISTER.SIGN_IN' | translate }}</a>
    </div>
  </div>

  <div class="background-decoration">
    <div class="circle circle-1"></div>
    <div class="circle circle-2"></div>
    <div class="circle circle-3"></div>
  </div>
</div>
`;

// Guardar el archivo
const htmlPath = path.join(__dirname, 'src/app/iam/pages/register/register.page.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('✅ Archivo HTML del registro creado exitosamente con mensaje de éxito!');

