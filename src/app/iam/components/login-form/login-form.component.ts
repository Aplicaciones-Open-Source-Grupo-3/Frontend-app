import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    email: [''],
    password: ['']
  });

  @Output() submitted = new EventEmitter<{ email: string; password: string }>();

  submit(): void {
    if (this.form.valid) {
      this.submitted.emit(this.form.getRawValue() as { email: string; password: string });
    }
  }
}
