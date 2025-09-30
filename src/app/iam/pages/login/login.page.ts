import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-iam-login-page',
  standalone: true,
  imports: [LoginFormComponent, TranslateModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IamLoginPageComponent {
  private readonly authService = inject(AuthService);
  protected readonly translate = inject(TranslateService);

  onSubmit(credentials: { email: string; password: string }): void {
    this.authService.login(credentials.email, credentials.password).subscribe();
  }
}
