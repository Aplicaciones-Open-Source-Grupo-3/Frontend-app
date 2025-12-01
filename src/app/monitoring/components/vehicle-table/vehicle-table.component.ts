import { Component, input, output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { VehicleEntity } from '../../model/vehicle.entity';

@Component({
  selector: 'app-vehicle-table',
  standalone: true,
  imports: [NgFor, NgIf, TranslateModule],
  templateUrl: './vehicle-table.component.html',
  styleUrls: ['./vehicle-table.component.css']
})
export class VehicleTableComponent {
  readonly vehicles = input.required<VehicleEntity[]>();
  readonly vehicleExit = output<number | string>();

  onExit(id: number | string): void {
    this.vehicleExit.emit(id);
  }
}
