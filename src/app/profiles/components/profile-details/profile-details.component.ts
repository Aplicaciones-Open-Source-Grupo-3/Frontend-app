import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileEntity } from '../../model/profile.entity';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileDetailsComponent {
  @Input({ required: true }) profile!: ProfileEntity;
}
