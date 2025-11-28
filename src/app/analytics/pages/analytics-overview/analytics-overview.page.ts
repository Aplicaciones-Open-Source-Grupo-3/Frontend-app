import { NgFor, NgIf, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription, forkJoin } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import { ParkingSettingsService } from '../../../profiles/services/parking-settings.service';
import { AccountingService } from '../../../accounting/services/accounting.service';
import { ExportService } from '../../services/export.service';

/**
 * Renders the Reports/Analytics Overview page.
 */
@Component({
  selector: 'app-analytics-overview-page',
  standalone: true,
  imports: [
    NgFor, NgIf, DatePipe, DecimalPipe,
    TranslateModule
  ],
  templateUrl: './analytics-overview.page.html',
  styleUrls: ['./analytics-overview.page.css']
})
export class AnalyticsOverviewPageComponent implements OnInit, OnDestroy {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly parkingSettingsService = inject(ParkingSettingsService);
  private readonly accountingService = inject(AccountingService);
  private readonly exportService = inject(ExportService);
  private readonly cdr = inject(ChangeDetectorRef);
  private subscription?: Subscription;

  stats: any = null;
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadAnalyticsData();
  }

  /**
   * Exportar a PDF
   */
  exportPDF(): void {
    console.log('📄 Exportando reporte a PDF...');
    this.exportService.exportToPDF();
  }

  /**
   * Exportar a Excel
   */
  exportExcel(): void {
    console.log('📊 Exportando reporte a Excel...');
    this.exportService.exportToExcel();
  }

  private loadAnalyticsData(): void {
    this.isLoading = true;
    this.error = null;

    // Calcular fechas
    const today = this.analyticsService.getDateString(0);
    const sevenDaysAgo = this.analyticsService.getDateString(7);

    console.log('📅 Cargando analytics:', { today, sevenDaysAgo });

    // Llamar a los endpoints en paralelo, incluyendo accounting records
    this.subscription = forkJoin({
      stats: this.analyticsService.getAnalyticsStats(),
      revenueTrend: this.analyticsService.getRevenueTrend(sevenDaysAgo, today),
      occupancyRate: this.analyticsService.getOccupancyRate(),
      peakHours: this.analyticsService.getPeakHours(today),
      parkingSettings: this.parkingSettingsService.getSettings(),
      accountingRecords: this.accountingService.getAll()
    }).subscribe({
      next: (data) => {
        console.log('📊 Analytics data loaded:', data);
        console.log('📈 Revenue trend raw data:', data.revenueTrend);

        // Transformar los datos para el template
        let dailyRevenue = this.transformRevenueTrend(data.revenueTrend);

        // Si el endpoint no devuelve datos, calcular desde accounting records
        if (!dailyRevenue || dailyRevenue.length === 0) {
          console.log('⚠️ Revenue trend vacío, calculando desde accounting records...');
          dailyRevenue = this.calculateDailyRevenueFromAccounting(data.accountingRecords, sevenDaysAgo, today);
        }

        console.log('📊 Daily revenue transformado:', dailyRevenue);

        const peakHours = this.transformPeakHours(data.peakHours);

        // Obtener la capacidad máxima REAL desde parking-settings
        const maxCapacity = data.parkingSettings.maxCapacity || 100;
        const currentVehicles = data.stats.totalVehiclesInside || 0;

        // Calcular occupancy rate dinámicamente con la capacidad real
        const calculatedOccupancyRate = maxCapacity > 0
          ? (currentVehicles / maxCapacity) * 100
          : 0;

        // Calcular revenue y vehicles por tipo desde accounting records
        const revenueByType = this.calculateRevenueByType(data.accountingRecords);
        const vehiclesByType = this.calculateVehiclesByType(data.accountingRecords);

        // IMPORTANTE: Calcular estadía promedio DIRECTAMENTE desde los datos del backend
        // Usar el campo hoursParked que viene del backend
        const averageStay = this.calculateAverageStayFromBackend(data.accountingRecords);

        console.log('🚗 Cálculo de ocupación:', {
          currentVehicles,
          maxCapacity: maxCapacity + ' (capacidad real del estacionamiento)',
          occupancyRate: calculatedOccupancyRate.toFixed(1) + '%',
          formula: `(${currentVehicles} / ${maxCapacity}) * 100 = ${calculatedOccupancyRate.toFixed(1)}%`
        });

        console.log('💰 Revenue por tipo:', revenueByType);
        console.log('🚙 Vehículos por tipo:', vehiclesByType);
        console.log('⏱️ Estadía promedio desde backend (hoursParked):', averageStay.toFixed(2) + ' horas');

        this.stats = {
          // Datos del endpoint /stats
          totalRevenue: data.stats.monthRevenue || 0,
          totalVehicles: data.stats.totalVehiclesToday || 0,
          currentVehicles: currentVehicles,
          averageStay: averageStay, // Usando datos del backend

          // Ocupancy rate calculado dinámicamente con capacidad REAL
          occupancyRate: calculatedOccupancyRate,
          maxCapacity: maxCapacity,

          // Datos transformados del endpoint /revenue-trend o calculados
          dailyRevenue: dailyRevenue,

          // Revenue y vehículos por tipo calculados desde accounting
          revenueByType: revenueByType,
          vehiclesByType: vehiclesByType,

          // Datos transformados del endpoint /peak-hours
          peakHours: peakHours
        };

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading analytics data:', err);
        this.error = 'Error al cargar los datos de análisis. Verifica que el backend esté corriendo.';
        this.isLoading = false;

        // Datos por defecto en caso de error
        this.stats = {
          totalRevenue: 0,
          totalVehicles: 0,
          currentVehicles: 0,
          occupancyRate: 0,
          maxCapacity: 100,
          averageStay: 0,
          peakHours: [],
          dailyRevenue: [],
          revenueByType: { cars: 0, motorcycles: 0 },
          vehiclesByType: { cars: 0, motorcycles: 0 }
        };

        this.cdr.detectChanges();
      }
    });
  }

  // Transformar el objeto de revenue trend a array para el gráfico
  private transformRevenueTrend(revenueTrend: { [date: string]: number }): { date: string; revenue: number }[] {
    if (!revenueTrend || Object.keys(revenueTrend).length === 0) {
      console.log('⚠️ Revenue trend está vacío o es null');
      return [];
    }

    return Object.entries(revenueTrend).map(([date, revenue]) => ({
      date,
      revenue
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  // Calcular daily revenue desde accounting records (fallback)
  private calculateDailyRevenueFromAccounting(
    records: any[],
    startDate: string,
    endDate: string
  ): { date: string; revenue: number }[] {
    console.log('🔍 Calculando daily revenue desde accounting...');
    console.log('📅 Rango de fechas:', { startDate, endDate });
    console.log('📋 Total de registros accounting:', records.length);

    // Mostrar algunos registros para debug
    console.log('🔎 Primeros 3 registros completos:', records.slice(0, 3));

    const revenueByDate: { [date: string]: number } = {};

    // Inicializar todos los días con 0
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      revenueByDate[dateStr] = 0;
    }

    console.log('📊 Fechas inicializadas:', Object.keys(revenueByDate));

    // Sumar ingresos por fecha
    let recordsProcessed = 0;
    let recordsOutOfRange = 0;
    const exitDatesFound: string[] = [];

    records.forEach((record, index) => {
      if (record.exitDate) {
        // Intentar extraer la fecha en diferentes formatos
        let exitDate: string;

        if (record.exitDate.includes('T')) {
          // Formato ISO: "2025-11-07T14:30:00"
          exitDate = record.exitDate.split('T')[0];
        } else if (record.exitDate.includes(' ')) {
          // Formato con espacio: "2025-11-07 14:30:00"
          exitDate = record.exitDate.split(' ')[0];
        } else {
          // Ya es solo fecha: "2025-11-07"
          exitDate = record.exitDate;
        }

        // Guardar las fechas encontradas
        if (index < 5) {
          exitDatesFound.push(exitDate);
        }

        // Verificar si la fecha está en el rango
        if (exitDate >= startDate && exitDate <= endDate) {
          const amount = record.amountPaid || 0;
          revenueByDate[exitDate] = (revenueByDate[exitDate] || 0) + amount;
          recordsProcessed++;

          console.log(`✅ Record procesado #${recordsProcessed}:`, {
            exitDate,
            amountPaid: amount,
            vehicleType: record.vehicleType,
            plate: record.plate
          });
        } else {
          recordsOutOfRange++;
          if (recordsOutOfRange <= 3) {
            console.log(`⏰ Record fuera de rango #${recordsOutOfRange}:`, {
              exitDate,
              enRango: `${startDate} - ${endDate}`,
              amountPaid: record.amountPaid
            });
          }
        }
      } else {
        if (index < 3) {
          console.log(`⚠️ Record #${index + 1} no tiene exitDate:`, {
            id: record.id,
            plate: record.plate,
            entryDate: record.entryDate
          });
        }
      }
    });

    console.log('📅 Exit dates encontradas (primeras 5):', exitDatesFound);
    console.log(`📊 Registros procesados: ${recordsProcessed} de ${records.length}`);
    console.log(`⏰ Registros fuera de rango: ${recordsOutOfRange}`);

    // Convertir a array y ordenar
    const result = Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log('✅ Daily revenue calculado:', result);

    // Verificar si hay ingresos totales
    const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);
    console.log(`💰 Total revenue en el período: S/ ${totalRevenue.toFixed(2)}`);

    // Si no hay datos en los últimos 7 días, usar todos los registros disponibles
    if (totalRevenue === 0 && records.length > 0) {
      console.log('⚠️ No hay datos en últimos 7 días, usando TODOS los registros disponibles...');
      return this.calculateAllTimeRevenue(records);
    }

    return result;
  }

  // Calcular ingresos de todos los registros disponibles (sin filtro de fecha)
  private calculateAllTimeRevenue(records: any[]): { date: string; revenue: number }[] {
    const revenueByDate: { [date: string]: number } = {};

    records.forEach(record => {
      if (record.exitDate) {
        let exitDate: string;

        if (record.exitDate.includes('T')) {
          exitDate = record.exitDate.split('T')[0];
        } else if (record.exitDate.includes(' ')) {
          exitDate = record.exitDate.split(' ')[0];
        } else {
          exitDate = record.exitDate;
        }

        const amount = record.amountPaid || 0;
        revenueByDate[exitDate] = (revenueByDate[exitDate] || 0) + amount;
      }
    });

    // Convertir a array, ordenar y tomar los últimos 7 días con datos
    const allDates = Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Últimos 7 días con datos

    console.log('✅ Revenue de últimos registros disponibles:', allDates);
    return allDates;
  }

  // Transformar el objeto de peak hours a array para el gráfico
  private transformPeakHours(peakHours: { [hour: string]: number }): { hour: string; count: number }[] {
    console.log('🕐 Transformando peak hours:', peakHours);

    if (!peakHours || Object.keys(peakHours).length === 0) {
      console.log('⚠️ Peak hours está vacío o es null');
      return [];
    }

    const result = Object.entries(peakHours)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 horas pico

    console.log('✅ Peak hours transformado:', result);
    return result;
  }

  // Calcular promedio de estadía desde accounting records del día actual
  private calculateAverageStayFromRecords(records: any[]): number {
    const today = new Date().toISOString().split('T')[0]; // Fecha de hoy en formato YYYY-MM-DD
    const todayRecords = records.filter((record: any) => record.exitDate && record.exitDate.startsWith(today));

    if (todayRecords.length === 0) {
      console.log('⚠️ No hay registros de hoy, retornando 0');
      return 0; // Retornar 0 si no hay registros
    }

    const totalStayTime = todayRecords.reduce((total: number, record: any) => {
      const entryTime = new Date(record.entryDate).getTime();
      const exitTime = new Date(record.exitDate).getTime();
      const stayDuration = (exitTime - entryTime) / (1000 * 60 * 60); // Duración en horas
      return total + stayDuration;
    }, 0);

    const averageStay = totalStayTime / todayRecords.length;

    console.log(`📏 Promedio de estadía calculado: ${averageStay.toFixed(2)} horas (${todayRecords.length} registros)`);

    return averageStay;
  }

  /**
   * Calcular estadía promedio DIRECTAMENTE desde el campo hoursParked del backend
   */
  private calculateAverageStayFromBackend(records: any[]): number {
    if (!records || records.length === 0) {
      console.log('⚠️ No hay registros para calcular average stay');
      return 0;
    }

    // Usar el campo hoursParked que viene directamente del backend
    const totalHours = records.reduce((sum, record) => {
      const hours = record.hoursParked || 0;
      return sum + hours;
    }, 0);

    const average = totalHours / records.length;

    console.log('📊 Cálculo de Average Stay:', {
      totalRecords: records.length,
      totalHours: totalHours.toFixed(2),
      average: average.toFixed(2),
      formula: `${totalHours.toFixed(2)} / ${records.length} = ${average.toFixed(2)} horas`
    });

    return average;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getMaxRevenue(dailyRevenue: any[]): number {
    if (!dailyRevenue || dailyRevenue.length === 0) return 0;
    return Math.max(...dailyRevenue.map(d => d.revenue));
  }

  getBarHeight(revenue: number, maxRevenue: number): string {
    if (maxRevenue === 0) return '0%';
    return `${(revenue / maxRevenue) * 100}%`;
  }

  getPeakHourWidth(count: number, peakHours: any[]): string {
    if (!peakHours || peakHours.length === 0 || !peakHours[0]) return '0%';
    const maxCount = peakHours[0].count;
    if (maxCount === 0) return '0%';
    return `${(count / maxCount * 100)}%`;
  }

  onExportPDF(): void {
    alert('Exportando reporte en PDF...');
  }

  onExportExcel(): void {
    alert('Exportando reporte en Excel...');
  }

  // Calcular ingresos por tipo de vehículo desde accounting records
  private calculateRevenueByType(records: any[]): { cars: number; motorcycles: number } {
    const revenue = { cars: 0, motorcycles: 0 };

    records.forEach(record => {
      const amount = record.amountPaid || 0;
      if (record.vehicleType === 'CAR' || record.vehicleType === 'TRUCK') {
        revenue.cars += amount;
      } else if (record.vehicleType === 'MOTORCYCLE') {
        revenue.motorcycles += amount;
      }
    });

    return revenue;
  }

  // Calcular cantidad de vehículos por tipo desde accounting records
  private calculateVehiclesByType(records: any[]): { cars: number; motorcycles: number } {
    const vehicles = { cars: 0, motorcycles: 0 };

    records.forEach(record => {
      if (record.vehicleType === 'CAR' || record.vehicleType === 'TRUCK') {
        vehicles.cars++;
      } else if (record.vehicleType === 'MOTORCYCLE') {
        vehicles.motorcycles++;
      }
    });

    return vehicles;
  }
}
