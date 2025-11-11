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
      const formValue = this.vehicleForm.value;

      const vehicle = {
        plate: formValue.plate.toUpperCase(),
        vehicleType: formValue.vehicleType
      };

      this.vehicleService.addVehicle(vehicle).subscribe({
        next: () => {
          this.vehicleForm.reset({ vehicleType: 'auto-camioneta' });
          this.vehicleAdded.emit();
        },
        error: (err) => {
          console.error('❌ Error al registrar vehículo:', err);
          alert('Error al registrar el vehículo. Por favor, intente nuevamente.');
        }
      });
    }
  }
}
