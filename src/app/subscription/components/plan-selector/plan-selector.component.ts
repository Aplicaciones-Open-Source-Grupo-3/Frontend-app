import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { PlanEntity } from '../../model/plan.entity';

@Component({
  selector: 'app-plan-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './plan-selector.component.html',
  styleUrls: ['./plan-selector.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanSelectorComponent {
  @Input({ required: true }) plans: PlanEntity[] = [];
  @Output() selected = new EventEmitter<PlanEntity>();

  choose(plan: PlanEntity): void {
    this.selected.emit(plan);
  }
}
