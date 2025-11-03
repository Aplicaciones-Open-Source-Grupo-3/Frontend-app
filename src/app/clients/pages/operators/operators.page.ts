import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SubscriberService } from '../../services/subscriber.service';
import { SubscriberEntity } from '../../model/subscriber.entity';
import { SubscriberTableComponent } from '../../components/subscriber-table/subscriber-table.component';
import { SubscriberFormComponent } from '../../components/subscriber-form/subscriber-form.component';

@Component({
  selector: 'app-clients-subscribers-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, SubscriberTableComponent, SubscriberFormComponent],
  templateUrl: './operators.page.html',
  styleUrls: ['./operators.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsOperatorsPageComponent {
  private readonly subscriberService = inject(SubscriberService);

  readonly subscribers = signal<SubscriberEntity[]>([]);
  readonly showForm = signal(false);
  readonly searchTerm = signal('');
  readonly isLoading = signal(false);

  constructor() {
    this.loadSubscribers();
  }

  loadSubscribers(): void {
    this.isLoading.set(true);
    this.subscriberService.getAll().subscribe({
      next: (subscribers) => {
        this.subscribers.set(subscribers);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading subscribers:', err);
        this.isLoading.set(false);
      }
    });
  }

  openForm(): void {
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
  }

  handleSubmit(subscriber: Omit<SubscriberEntity, 'id'>): void {
    this.subscriberService.create(subscriber).subscribe({
      next: () => {
        this.loadSubscribers();
        this.closeForm();
      },
      error: (err) => {
        console.error('Error creating subscriber:', err);
      }
    });
  }

  handleDelete(id: string): void {
    if (confirm('¿Está seguro que desea eliminar este abonado?')) {
      this.subscriberService.delete(id).subscribe({
        next: () => {
          this.loadSubscribers();
        },
        error: (err) => {
          console.error('Error deleting subscriber:', err);
        }
      });
    }
  }

  get filteredSubscribers(): SubscriberEntity[] {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.subscribers();
    }
    return this.subscribers().filter(sub =>
      sub.name.toLowerCase().includes(term) ||
      sub.phone.includes(term) ||
      (sub.vehiclePlate && sub.vehiclePlate.toLowerCase().includes(term))
    );
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
}
