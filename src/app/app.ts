import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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

  readonly availableLangs: LanguageOption[] = [
    { label: 'EN', code: 'en' },
    { label: 'ES', code: 'es' }
  ];

  readonly navItems: NavItem[] = [
    { label: 'NAV.DASHBOARD', route: '/monitoring/dashboard' },
    { label: 'NAV.PARKING', route: '/monitoring/incidents' },
    { label: 'NAV.SPACES', route: '/profiles/overview' },
    { label: 'NAV.SUBSCRIPTIONS', route: '/subscription/overview' },
    { label: 'NAV.CLIENTS', route: '/iam/login' },
    { label: 'NAV.REPORTS', route: '/analytics/overview' }
  ];

  readonly currentLang = signal(this.translate.currentLang || this.translate.getDefaultLang() || 'en');
  readonly languageLabel = computed(() => this.currentLang().toUpperCase());

  constructor() {
    this.translate.onLangChange.subscribe(({ lang }) => this.currentLang.set(lang as 'en' | 'es'));
  }

  switchLanguage(lang: 'en' | 'es'): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
  }
}
