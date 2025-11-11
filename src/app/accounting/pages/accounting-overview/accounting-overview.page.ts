import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest, map } from 'rxjs';
import { AccountingService } from '../../services/accounting.service';
import { AccountingRecord } from '../../model/accounting-record.entity';
import { AccountingTableComponent } from '../../components/accounting-table/accounting-table.component';
import { AccountingSummaryComponent, AccountingSummary } from '../../components/accounting-summary/accounting-summary.component';
import { ParkingSettingsService } from '../../../profiles/services/parking-settings.service';

@Component({
  selector: 'app-accounting-overview-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, AccountingTableComponent, AccountingSummaryComponent],
  templateUrl: './accounting-overview.page.html',
  styleUrls: ['./accounting-overview.page.css']
})
export class AccountingOverviewPageComponent implements OnInit {
  private readonly accountingService = inject(AccountingService);
  private readonly settingsService = inject(ParkingSettingsService);

  readonly searchPlate = signal('');
  readonly selectedVehicleType = signal<'all' | 'auto-camioneta' | 'moto'>('all');
  readonly selectedDate = signal('');

  records$!: Observable<AccountingRecord[]>;
  filteredRecords$!: Observable<AccountingRecord[]>;
  summary$!: Observable<AccountingSummary>;

  ngOnInit(): void {
    this.records$ = this.accountingService.getAll();
    this.filteredRecords$ = this.records$;
    this.loadSummary();
  }

  onSearchChange(plate: string): void {
    this.searchPlate.set(plate);
    this.filterRecords();
  }

  onVehicleTypeChange(type: 'all' | 'auto-camioneta' | 'moto'): void {
    this.selectedVehicleType.set(type);
    this.filterRecords();
  }

  onDateChange(date: string): void {
    this.selectedDate.set(date);
    this.filterRecords();
  }

  private filterRecords(): void {
    const searchTerm = this.searchPlate().trim().toUpperCase();
    const vehicleType = this.selectedVehicleType();
    const selectedDate = this.selectedDate();

    this.filteredRecords$ = this.records$.pipe(
      map(records => {
        let filtered = records;

        // Filtrar por tipo de vehículo
        if (vehicleType !== 'all') {
          filtered = filtered.filter(r => r.vehicleType === vehicleType);
        }

        // Filtrar por fecha de operación
        if (selectedDate !== '') {
          filtered = filtered.filter(r => r.operationDate === selectedDate);
        }

        // Filtrar por placa
        if (searchTerm !== '') {
          filtered = filtered.filter(r => r.plate.toUpperCase().includes(searchTerm));
        }

        return filtered;
      })
    );
  }

  private loadSummary(): void {
    this.summary$ = combineLatest([
      this.accountingService.getTotalRevenue(),
      this.accountingService.getTotalVehicles(),
      this.accountingService.getRevenueByVehicleType(),
      this.accountingService.getAverageStayTime(),
      this.settingsService.getSettings()
    ]).pipe(
      map(([totalRevenue, totalVehicles, revenueByType, avgStay, settings]: [number, number, any, number, any]) => ({
        totalRevenue,
        totalVehicles,
        carRevenue: revenueByType.cars,
        motorcycleRevenue: revenueByType.motorcycles,
        averageStayTime: avgStay,
        currency: this.getCurrencySymbol(settings.currency)
      }))
    );
  }

  private getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      'PEN': 'S/',
      'USD': '$',
      'EUR': '€'
    };
    return symbols[currency] || currency;
  }
}
