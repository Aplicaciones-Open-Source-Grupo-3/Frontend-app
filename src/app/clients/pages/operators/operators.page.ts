import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Operator } from '../../models/operator.model';
import { OperatorsService } from '../../services/operators.service';

@Component({
  selector: 'app-clients-operators-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './operators.page.html',
  styleUrls: ['./operators.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsOperatorsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly operatorsService = inject(OperatorsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly operators = signal<Operator[]>([]);
  readonly searchTerm = signal('');
  readonly showForm = signal(false);
  readonly isSubmitting = signal(false);
  readonly menuOpenFor = signal<number | null>(null);

  readonly operatorForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]]
  });

  readonly filteredOperators = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.operators();
    }

    return this.operators().filter((operator) => {
      const haystack = `${operator.name} ${operator.email}`.toLowerCase();
      return haystack.includes(term);
    });
  });

  readonly trackById = (_: number, operator: Operator) => operator.id;

  ngOnInit(): void {
    this.loadOperators();
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.operators__actions')) {
      this.menuOpenFor.set(null);
    }
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  openForm(): void {
    this.showForm.set(true);
  }

  closeForm(): void {
    this.operatorForm.reset({ name: '', email: '' });
    this.showForm.set(false);
    this.isSubmitting.set(false);
  }

  submit(): void {
    if (this.operatorForm.invalid) {
      this.operatorForm.markAllAsTouched();
      return;
    }

    const { name, email } = this.operatorForm.getRawValue();

    this.isSubmitting.set(true);

    this.operatorsService
      .createOperator({ name, email })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (operator) => {
          this.operators.update((current) => {
            const updated = [operator, ...current];
            return updated.sort((a, b) => b.id - a.id);
          });
          this.closeForm();
        },
        error: (error) => {
          console.error('Failed to create operator', error);
          this.isSubmitting.set(false);
        }
      });
  }

  toggleMenu(operatorId: number): void {
    this.menuOpenFor.update((current) => (current === operatorId ? null : operatorId));
  }

  deleteOperator(operator: Operator): void {
    if (operator.role !== 'operator') {
      return;
    }

    this.operatorsService
      .deleteOperator(operator.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.operators.update((current) => current.filter((item) => item.id !== operator.id));
          this.menuOpenFor.set(null);
        },
        error: (error) => {
          console.error('Failed to delete operator', error);
          this.menuOpenFor.set(null);
        }
      });
  }

  private loadOperators(): void {
    this.operatorsService
      .getOperators()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (operators) => {
          const sorted = [...operators].sort((a, b) => b.id - a.id);
          this.operators.set(sorted);
        },
        error: (error) => console.error('Failed to load operators', error)
      });
  }
}
