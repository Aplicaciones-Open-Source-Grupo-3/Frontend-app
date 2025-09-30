import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SubscriptionEntity } from '../../model/subscription.entity';
import { PlanEntity } from '../../model/plan.entity';

@Component({
  selector: 'app-subscription-card',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './subscription-card.component.html',
  styleUrls: ['./subscription-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionCardComponent {
  @Input({ required: true }) subscription!: SubscriptionEntity;
  @Input({ required: true }) plan!: PlanEntity;
}
