import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../iam/services/auth.service';
import { UserEntity, BusinessEntity } from '../../../iam/model/user.entity';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileDetailsComponent {
  private readonly authService = inject(AuthService);

  readonly currentUser$ = this.authService.currentUser$;
  readonly currentBusiness$ = this.authService.currentBusiness$;

  /**
   * Obtiene la etiqueta de traducción según el rol del usuario
   * Normaliza el rol para soportar: ROLE_ADMIN, admin, Admin, ADMIN
   */
  getRoleLabel(role: string): string {
    const normalizedRole = role?.toString().toUpperCase();
    return normalizedRole === 'ROLE_ADMIN' || normalizedRole === 'ADMIN'
      ? 'PROFILES.DETAILS.ADMIN'
      : 'PROFILES.DETAILS.OPERATOR';
  }

  onLogout(): void {
    this.authService.logout();
  }
}
