import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

export interface AccountingSummary {
  totalRevenue: number;
  totalVehicles: number;
  carRevenue: number;
  motorcycleRevenue: number;
  averageStayTime: number;
  currency: string;
}

@Component({
  selector: 'app-accounting-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './accounting-summary.component.html',
  styleUrls: ['./accounting-summary.component.css']
})
export class AccountingSummaryComponent {
  readonly summary = input.required<AccountingSummary>();
}

