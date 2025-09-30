import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-section',
  standalone: true,
  template: `
    <div class="empty-section">
      <p>{{ message }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptySectionComponent {
  @Input() message = 'Nothing to display yet.';
}
