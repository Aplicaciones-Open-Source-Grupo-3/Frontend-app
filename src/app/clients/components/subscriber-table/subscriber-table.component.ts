import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { SubscriberResource } from '../../services/subscriber.service';

@Component({
  selector: 'app-subscriber-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './subscriber-table.component.html',
  styleUrls: ['./subscriber-table.component.css']
})
export class SubscriberTableComponent {
  readonly subscribers = input.required<SubscriberResource[]>();
  readonly onDelete = output<string>();

  deleteSubscriber(id: string): void {
    this.onDelete.emit(id);
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  calculateExpiryDate(startDate: string, months: number): string {
    const start = new Date(startDate);
    start.setMonth(start.getMonth() + months);
    return start.toLocaleDateString('es-PE');
  }
}
