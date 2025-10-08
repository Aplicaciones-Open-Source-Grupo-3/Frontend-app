import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { VehicleService } from '../../services/vehicle.service';
import { VehicleType, VehicleEntity } from '../../model/vehicle.entity';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.css']
})
export class VehicleFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly vehicleService = inject(VehicleService);

  readonly vehicles = input.required<VehicleEntity[]>();
  readonly vehicleAdded = output<void>();

  readonly vehicleForm: FormGroup = this.fb.group({
    plate: ['', [Validators.required, Validators.minLength(3)]],
    vehicleType: ['auto-camioneta' as VehicleType, Validators.required]
  });

  onSubmit(): void {
    if (this.vehicleForm.valid) {
      const now = new Date();
      const formValue = this.vehicleForm.value;

      const vehicle = {
        plate: formValue.plate.toUpperCase(),
        vehicleType: formValue.vehicleType,
        entryDate: this.formatDate(now),
        entryTime: this.formatTime(now),
        registrationNumber: this.generateNextRegistrationNumber(),
        status: 'in-space' as const
      };

      this.vehicleService.addVehicle(vehicle).subscribe(() => {
        this.vehicleForm.reset({ vehicleType: 'auto-camioneta' });
        this.vehicleAdded.emit();
      });
    }
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private generateNextRegistrationNumber(): string {
    const currentVehicles = this.vehicles();

    if (currentVehicles.length === 0) {
      return '0001';
    }

    // Encontrar el número más alto
    const maxNumber = currentVehicles.reduce((max, vehicle) => {
      const num = parseInt(vehicle.registrationNumber, 10);
      return num > max ? num : max;
    }, 0);

    // Incrementar y formatear
    const nextNumber = maxNumber + 1;
    return String(nextNumber).padStart(4, '0');
  }
}
