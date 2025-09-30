import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { EntryExitEntity } from '../../model/entry-exit.entity';
import { formatTime } from '../../../shared/utils/date-format.util';

@Component({
  selector: 'app-vehicle-entry-exit',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './vehicle-entry-exit.component.html',
  styleUrls: ['./vehicle-entry-exit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleEntryExitComponent {
  @Input({ required: true }) movements: EntryExitEntity[] = [];

  protected formatTime = formatTime;
}
