import { ChangeDetectionStrategy, Component, forwardRef, inject, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

import { RoleService } from '../../services/role.service';
import { RoleEntity } from '../../model/role.entity';
import { AsyncPipe, NgFor } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, AsyncPipe, TranslateModule],
  templateUrl: './role-selector.component.html',
  styleUrls: ['./role-selector.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RoleSelectorComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleSelectorComponent implements ControlValueAccessor {
  private readonly roleService = inject(RoleService);

  @Input() label = 'IAM.REGISTER.ROLE';

  readonly roles$: Observable<RoleEntity[]> = this.roleService.getRoles();

  value: string | null = null;
  disabled = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  select(value: string): void {
    const nextValue = value || null;
    this.value = nextValue;
    this.onChange(nextValue);
    this.onTouched();
  }
}
