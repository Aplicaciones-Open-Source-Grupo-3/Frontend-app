import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { RegisterFormComponent } from '../../components/register-form/register-form.component';

@Component({
  selector: 'app-iam-register-page',
  standalone: true,
  imports: [RegisterFormComponent, TranslateModule],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IamRegisterPageComponent {}
