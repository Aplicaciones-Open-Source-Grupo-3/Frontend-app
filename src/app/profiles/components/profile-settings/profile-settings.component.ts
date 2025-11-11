import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ParkingSettingsService } from '../../services/parking-settings.service';
import { ParkingSettingsEntity } from '../../model/parking-settings.entity';
import { AuthService } from '../../../iam/services/auth.service';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(ParkingSettingsService);
  private readonly authService = inject(AuthService);

  readonly saveSuccess = signal(false);
  readonly settingsForm: FormGroup;
  readonly isAdmin = signal(false);

  constructor() {
    // Verificar si el usuario es admin usando el método correcto del servicio
    this.isAdmin.set(this.authService.isAdmin());

    console.log('🎭 [ProfileSettings] Usuario es admin:', this.isAdmin());

    this.settingsForm = this.fb.group({
      openingTime: ['08:00', Validators.required],
      closingTime: ['22:00', Validators.required],
      motorcycleRate: [2, [Validators.required, Validators.min(0)]],
      carTruckRate: [4, [Validators.required, Validators.min(0)]],
      nightRate: [20, [Validators.required, Validators.min(0)]],
      maxCapacity: [100, [Validators.required, Validators.min(1)]],
      currency: ['PEN', Validators.required],
      gracePeriodMinutes: [15, [Validators.required, Validators.min(0)]],
      allowOvernight: [true]
    });

    // Si no es admin, deshabilitar el formulario
    if (!this.isAdmin()) {
      this.settingsForm.disable();
      console.log('⚠️ [ProfileSettings] Formulario deshabilitado - Usuario no es admin');
    } else {
      console.log('✅ [ProfileSettings] Formulario habilitado - Usuario es admin');
    }

    this.loadSettings();
  }

  private loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (settings: ParkingSettingsEntity) => {
        this.settingsForm.patchValue(settings);
        // Asegurar que el formulario permanezca deshabilitado para operadores
        if (!this.isAdmin()) {
          this.settingsForm.disable();
        }
      },
      error: () => {
        // Si no hay configuración, usa los valores por defecto
      }
    });
  }

  onSubmit(): void {
    // Solo permitir guardar si es admin
    if (!this.isAdmin()) {
      return;
    }

    if (this.settingsForm.valid) {
      const settings = this.settingsForm.value;
      this.settingsService.updateSettings(settings).subscribe({
        next: () => {
          this.saveSuccess.set(true);
          setTimeout(() => this.saveSuccess.set(false), 3000);
        },
        error: (error) => {
          console.error('Error saving settings:', error);
        }
      });
    }
  }
}
