import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-kpi-graph',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <section class="graph">
      <header>
        <h2>{{ title }}</h2>
      </header>
      <div class="graph__placeholder">{{ 'ANALYTICS.GRAPH.PLACEHOLDER' | translate }}</div>
    </section>
  `,
  styles: [
    `
      .graph {
        background: rgba(15, 23, 42, 0.55);
        border-radius: 1rem;
        padding: 1.5rem;
        color: #e2e8f0;
        display: grid;
        gap: 1rem;
      }

      .graph__placeholder {
        height: 220px;
        border-radius: 1rem;
        background: repeating-linear-gradient(
          -45deg,
          rgba(148, 163, 184, 0.08),
          rgba(148, 163, 184, 0.08) 10px,
          rgba(71, 85, 105, 0.12) 10px,
          rgba(71, 85, 105, 0.12) 20px
        );
        display: grid;
        place-items: center;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiGraphComponent {
  @Input() title = '';
}
