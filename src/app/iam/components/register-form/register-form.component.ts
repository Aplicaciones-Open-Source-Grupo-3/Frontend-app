import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { RoleSelectorComponent } from '../role-selector/role-selector.component';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, RoleSelectorComponent],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name: [''],
    email: [''],
    password: [''],
    role: ['']
  });

  @Output() submitted = new EventEmitter<{ name: string; email: string; password: string; role: string }>();

  submit(): void {
    if (this.form.valid) {
      this.submitted.emit(this.form.getRawValue() as {
        name: string;
        email: string;
        password: string;
        role: string;
      });
    }
  }
}
