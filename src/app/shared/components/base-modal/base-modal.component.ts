import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  template: '<div class="base-modal">Base modal placeholder</div>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseModalComponent {}
