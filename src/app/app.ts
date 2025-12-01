import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs';

interface NavItem {
  label: string;
  route: string;
}

interface LanguageOption {
  label: string;
  code: 'en' | 'es';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  readonly availableLangs: LanguageOption[] = [
    { label: 'EN', code: 'en' },
    { label: 'ES', code: 'es' }
  ];

  readonly navItems: NavItem[] = [
    { label: 'NAV.DASHBOARD', route: '/monitoring/dashboard' },
    { label: 'NAV.PARKING', route: '/monitoring/management' },
    { label: 'NAV.SPACES', route: '/profiles/overview' },
    { label: 'NAV.ACCOUNTING', route: '/accounting/overview' },
    { label: 'NAV.CLIENTS', route: '/clients/operators' },
    { label: 'NAV.REPORTS', route: '/analytics/overview' }
  ];

  readonly currentLang = signal(this.translate.currentLang || this.translate.getDefaultLang() || 'en');
  readonly languageLabel = computed(() => this.currentLang().toUpperCase());
  readonly isAuthPage = signal(false);

  constructor() {
    this.translate.onLangChange.subscribe(({ lang }) => this.currentLang.set(lang as 'en' | 'es'));

    // Detectar si estamos en páginas de autenticación
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const authRoutes = ['/iam/login', '/iam/register'];
        this.isAuthPage.set(authRoutes.some(route => event.url.startsWith(route)));
      });

    // Verificar la ruta inicial
    const currentUrl = this.router.url;
    const authRoutes = ['/iam/login', '/iam/register'];
    this.isAuthPage.set(authRoutes.some(route => currentUrl.startsWith(route)));
  }

  switchLanguage(lang: 'en' | 'es'): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
  }
}
