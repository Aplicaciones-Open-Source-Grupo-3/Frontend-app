import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { SubscriptionService } from '../../services/subscription.service';
import { PlanService } from '../../services/plan.service';
import { SubscriptionCardComponent } from '../../components/subscription-card/subscription-card.component';
import { PlanSelectorComponent } from '../../components/plan-selector/plan-selector.component';
import { SubscriptionEntity } from '../../model/subscription.entity';
import { PlanEntity } from '../../model/plan.entity';

interface SubscriptionWithPlan {
  subscription: SubscriptionEntity;
  plan: PlanEntity;
}

@Component({
  selector: 'app-subscriptions-overview-page',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, TranslateModule, SubscriptionCardComponent, PlanSelectorComponent],
  templateUrl: './subscriptions-overview.page.html',
  styleUrls: ['./subscriptions-overview.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SubscriptionsOverviewPageComponent {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly planService = inject(PlanService);

  readonly vm$ = combineLatest([
    this.subscriptionService.getSubscriptions(),
    this.planService.getPlans()
  ]).pipe(
    map(([subscriptions, plans]) => ({
      plans,
      subscriptions: this.composeSubscriptionsWithPlans(subscriptions, plans)
    }))
  );

  private composeSubscriptionsWithPlans(subscriptions: SubscriptionEntity[], plans: PlanEntity[]): SubscriptionWithPlan[] {
    const planMap = new Map<number, PlanEntity>(plans.map((plan) => [Number(plan.id), plan]));
    return subscriptions
      .map((subscription) => {
        const plan = planMap.get(Number(subscription.planId));
        return plan ? { subscription, plan } : null;
      })
      .filter((value): value is SubscriptionWithPlan => value !== null);
  }
}
