import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-incident-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './incident-form.component.html',
  styleUrls: ['./incident-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncidentFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    location: [''],
    description: ['']
  });

  @Output() submitted = new EventEmitter<{ location: string; description: string }>();

  submit(): void {
    if (this.form.valid) {
      this.submitted.emit(this.form.getRawValue() as { location: string; description: string });
    }
  }
}
