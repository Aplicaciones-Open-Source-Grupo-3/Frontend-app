import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ParkingSettingsService } from '../../services/parking-settings.service';
import { ParkingSettingsEntity } from '../../model/parking-settings.entity';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule],
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(ParkingSettingsService);

  readonly saveSuccess = signal(false);
  readonly settingsForm: FormGroup;

  constructor() {
    this.settingsForm = this.fb.group({
      openingTime: ['08:00', Validators.required],
      closingTime: ['22:00', Validators.required],
      motorcycleRate: [2, [Validators.required, Validators.min(0)]],
      carTruckRate: [4, [Validators.required, Validators.min(0)]],
      maxCapacity: [100, [Validators.required, Validators.min(1)]],
      currency: ['PEN', Validators.required],
      gracePeriodMinutes: [15, [Validators.required, Validators.min(0)]],
      allowOvernight: [true]
    });

    this.loadSettings();
  }

  private loadSettings(): void {
    this.settingsService.getSettings().subscribe({
      next: (settings: ParkingSettingsEntity) => {
        this.settingsForm.patchValue(settings);
      },
      error: () => {
        // Si no hay configuración, usa los valores por defecto
      }
    });
  }

  onSubmit(): void {
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
