import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ParkingOverview } from '../../services/parking-lot.service';

@Component({
  selector: 'app-parking-lot-status',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './parking-lot-status.component.html',
  styleUrls: ['./parking-lot-status.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParkingLotStatusComponent {
  @Input({ required: true }) overview!: ParkingOverview;
}
