import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-business-data-settings',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <section class="card">
      <h2>{{ 'PROFILES.BUSINESS.TITLE' | translate }}</h2>
      <p>{{ 'PROFILES.BUSINESS.DESCRIPTION' | translate }}</p>
    </section>
  `,
  styles: [
    `
      .card {
        padding: 1.5rem;
        border-radius: 1rem;
        background: rgba(148, 163, 184, 0.08);
      }

      h2 {
        margin-top: 0;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessDataSettingsComponent {}
