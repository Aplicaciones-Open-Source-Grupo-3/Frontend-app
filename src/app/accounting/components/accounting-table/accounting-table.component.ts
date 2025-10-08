import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccountingRecord } from '../../model/accounting-record.entity';

@Component({
  selector: 'app-accounting-table',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './accounting-table.component.html',
  styleUrls: ['./accounting-table.component.css']
})
export class AccountingTableComponent {
  readonly records = input.required<AccountingRecord[]>();
}

