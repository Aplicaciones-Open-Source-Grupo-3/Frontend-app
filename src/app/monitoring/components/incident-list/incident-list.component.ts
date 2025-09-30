import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { IncidentEntity } from '../../model/incident.entity';
import { capitalize } from '../../../shared/utils/string-format.util';

@Component({
  selector: 'app-incident-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './incident-list.component.html',
  styleUrls: ['./incident-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentListComponent {
  @Input({ required: true }) incidents: IncidentEntity[] = [];

  protected capitalize = capitalize;
}
