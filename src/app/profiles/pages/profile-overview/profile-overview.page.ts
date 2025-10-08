import { AsyncPipe, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { ProfileDetailsComponent } from '../../components/profile-details/profile-details.component';
import { ProfileSettingsComponent } from '../../components/profile-settings/profile-settings.component';
import { ProfileEntity } from '../../model/profile.entity';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile-overview-page',
  standalone: true,
  imports: [AsyncPipe, NgIf, TranslateModule, ProfileDetailsComponent, ProfileSettingsComponent],
  templateUrl: './profile-overview.page.html',
  styleUrls: ['./profile-overview.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileOverviewPageComponent {
  private readonly profileService = inject(ProfileService);

  readonly profile$: Observable<ProfileEntity> = this.profileService.getProfile(1);
}
