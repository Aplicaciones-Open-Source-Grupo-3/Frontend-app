import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ProfileDetailsComponent } from '../../components/profile-details/profile-details.component';
import { ProfileSettingsComponent } from '../../components/profile-settings/profile-settings.component';

@Component({
  selector: 'app-profile-overview-page',
  standalone: true,
  imports: [TranslateModule, ProfileDetailsComponent, ProfileSettingsComponent],
  templateUrl: './profile-overview.page.html',
  styleUrls: ['./profile-overview.page.css']
})
export class ProfileOverviewPageComponent {
}
