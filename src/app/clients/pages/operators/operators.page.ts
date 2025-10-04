import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

interface Operator {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  status: 'active' | 'inactive';
  lastActiveKey: string;
}

const INITIAL_OPERATORS: Operator[] = [
  {
    id: 1,
    name: 'Ethan Harper',
    email: 'ethan.harper@example.com',
    role: 'admin',
    status: 'active',
    lastActiveKey: 'CLIENTS.OPERATORS.LAST_ACTIVE.DAYS_2'
  },
  {
    id: 2,
    name: 'Olivia Bennett',
    email: 'olivia.bennett@example.com',
    role: 'operator',
    status: 'active',
    lastActiveKey: 'CLIENTS.OPERATORS.LAST_ACTIVE.DAY_1'
  },
  {
    id: 3,
    name: 'Noah Carter',
    email: 'noah.carter@example.com',
    role: 'operator',
    status: 'inactive',
    lastActiveKey: 'CLIENTS.OPERATORS.LAST_ACTIVE.MONTHS_2'
  },
  {
    id: 4,
    name: 'Ava Mitchell',
    email: 'ava.mitchell@example.com',
    role: 'admin',
    status: 'active',
    lastActiveKey: 'CLIENTS.OPERATORS.LAST_ACTIVE.HOURS_6'
  },
  {
    id: 5,
    name: 'Liam Foster',
    email: 'liam.foster@example.com',
    role: 'operator',
    status: 'active',
    lastActiveKey: 'CLIENTS.OPERATORS.LAST_ACTIVE.DAYS_4'
  },
  {
    id: 6,
    name: 'Sophia Turner',
    email: 'sophia.turner@example.com',
    role: 'operator',
    status: 'active',
    lastActiveKey: 'CLIENTS.OPERATORS.LAST_ACTIVE.WEEKS_1'
  }
];

@Component({
  selector: 'app-clients-operators-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './operators.page.html',
  styleUrls: ['./operators.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsOperatorsPageComponent {
  private readonly fb = inject(FormBuilder);

  private nextId = INITIAL_OPERATORS.length + 1;

  readonly operators = signal<Operator[]>(INITIAL_OPERATORS);
  readonly searchTerm = signal('');
  readonly showForm = signal(false);

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

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  openForm(): void {
    this.showForm.set(true);
  }

  closeForm(): void {
    this.operatorForm.reset({ name: '', email: '' });
    this.showForm.set(false);
  }

  submit(): void {
    if (this.operatorForm.invalid) {
      this.operatorForm.markAllAsTouched();
      return;
    }

    const { name, email } = this.operatorForm.getRawValue();

    const newOperator: Operator = {
      id: this.nextId++,
      name,
      email,
      role: 'operator',
      status: 'active',
      lastActiveKey: 'CLIENTS.OPERATORS.LAST_ACTIVE.JUST_NOW'
    };

    this.operators.update((current) => [newOperator, ...current]);
    this.closeForm();
  }
}
