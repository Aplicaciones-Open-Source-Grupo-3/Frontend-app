import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { VehicleFormComponent } from '../vehicle-form/vehicle-form.component';
import { VehicleEntity } from '../../model/vehicle.entity';
import { ParkingCapacity } from '../../../profiles/services/parking-capacity.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-add-vehicle-modal',
  standalone: true,
  imports: [TranslateModule, VehicleFormComponent, NgIf],
  templateUrl: './add-vehicle-modal.component.html',
  styleUrls: ['./add-vehicle-modal.component.css']
})
export class AddVehicleModalComponent {
  readonly vehicles = input.required<VehicleEntity[]>();
  readonly capacity = input.required<ParkingCapacity>();
  readonly onCancel = output<void>();
  readonly onVehicleAdded = output<void>();

  cancel(): void {
    this.onCancel.emit();
  }

  handleVehicleAdded(): void {
    this.onVehicleAdded.emit();
  }

  get isFull(): boolean {
    return this.capacity().available <= 0;
  }
}
