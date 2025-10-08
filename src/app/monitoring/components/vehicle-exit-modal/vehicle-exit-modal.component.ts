import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ExitCalculation } from '../../model/exit-calculation.entity';

@Component({
  selector: 'app-vehicle-exit-modal',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './vehicle-exit-modal.component.html',
  styleUrls: ['./vehicle-exit-modal.component.css']
})
export class VehicleExitModalComponent {
  readonly calculation = input.required<ExitCalculation>();
  readonly onCancel = output<void>();
  readonly onConfirm = output<number | string>();

  cancel(): void {
    this.onCancel.emit();
  }

  confirm(): void {
    this.onConfirm.emit(this.calculation().vehicleId);
  }
}
