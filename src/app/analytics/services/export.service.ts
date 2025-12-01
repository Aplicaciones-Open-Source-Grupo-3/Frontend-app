import { Injectable, inject } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AccountingService, AccountingRecordResource } from '../../accounting/services/accounting.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ExportStatistics {
  totalRecords: number;
  totalRevenue: number;
  averageStayTime: number;
  totalHoursParked: number;
  totalHoursToPay: number;
  vehiclesByType: {
    cars: number;
    motorcycles: number;
  };
  revenueByType: {
    cars: number;
    motorcycles: number;
  };
  averageAmountPaid: number;
  maxStayTime: number;
  minStayTime: number;
  nightChargeTotal: number;
  averageRatePerHour: number;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly accountingService = inject(AccountingService);

  /**
   * Exportar registros de contabilidad a PDF con estadísticas detalladas
   */
  exportToPDF(): void {
    this.accountingService.getAll().subscribe(records => {
      if (!records || records.length === 0) {
        alert('No hay datos para exportar');
        return;
      }

      const stats = this.calculateStatistics(records);
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape para más espacio

      // Título del documento
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80);
      doc.text('REPORTE DE CONTABILIDAD - EASY PARK', 15, 15);

      // Fecha de generación
      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(`Generado el: ${new Date().toLocaleString('es-PE')}`, 15, 22);

      // Línea divisoria
      doc.setDrawColor(189, 195, 199);
      doc.line(15, 25, 282, 25);

      // === SECCIÓN DE ESTADÍSTICAS GENERALES ===
      let yPos = 32;
      doc.setFontSize(14);
      doc.setTextColor(52, 73, 94);
      doc.text('ESTADÍSTICAS GENERALES', 15, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(44, 62, 80);

      const generalStats = [
        [`Total de Registros:`, `${stats.totalRecords}`],
        [`Ingresos Totales:`, `S/ ${stats.totalRevenue.toFixed(2)}`],
        [`Promedio de Estadía:`, `${stats.averageStayTime.toFixed(2)} horas`],
        [`Total Horas Estacionadas:`, `${stats.totalHoursParked.toFixed(2)} h`],
        [`Total Horas Cobradas:`, `${stats.totalHoursToPay.toFixed(2)} h`],
        [`Monto Promedio por Vehículo:`, `S/ ${stats.averageAmountPaid.toFixed(2)}`],
        [`Tarifa Promedio por Hora:`, `S/ ${stats.averageRatePerHour.toFixed(2)}`],
        [`Cargo Nocturno Total:`, `S/ ${stats.nightChargeTotal.toFixed(2)}`]
      ];

      const col1X = 20;
      const col2X = 110;
      const col3X = 200;

      for (let i = 0; i < generalStats.length; i++) {
        const colX = i % 2 === 0 ? col1X : col2X;
        const row = Math.floor(i / 2);
        doc.setFont('helvetica', 'bold');
        doc.text(generalStats[i][0], colX, yPos + (row * 7));
        doc.setFont('helvetica', 'normal');
        doc.text(generalStats[i][1], colX + 55, yPos + (row * 7));
      }

      yPos += Math.ceil(generalStats.length / 2) * 7 + 5;

      // === ESTADÍSTICAS POR TIPO DE VEHÍCULO ===
      doc.setFontSize(14);
      doc.setTextColor(52, 73, 94);
      doc.text('ESTADÍSTICAS POR TIPO DE VEHÍCULO', 15, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(44, 62, 80);

      const typeStats = [
        ['Autos/Camionetas:', `${stats.vehiclesByType.cars} vehículos`, `S/ ${stats.revenueByType.cars.toFixed(2)}`],
        ['Motocicletas:', `${stats.vehiclesByType.motorcycles} vehículos`, `S/ ${stats.revenueByType.motorcycles.toFixed(2)}`]
      ];

      typeStats.forEach((stat, index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(stat[0], col1X, yPos + (index * 7));
        doc.setFont('helvetica', 'normal');
        doc.text(stat[1], col1X + 45, yPos + (index * 7));
        doc.text(stat[2], col1X + 85, yPos + (index * 7));
      });

      yPos += typeStats.length * 7 + 5;

      // === ESTADÍSTICAS DE TIEMPO ===
      doc.setFontSize(14);
      doc.setTextColor(52, 73, 94);
      doc.text('ESTADÍSTICAS DE TIEMPO', 15, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(44, 62, 80);

      const timeStats = [
        [`Máximo Tiempo de Estadía:`, `${stats.maxStayTime.toFixed(2)} horas`],
        [`Mínimo Tiempo de Estadía:`, `${stats.minStayTime.toFixed(2)} horas`]
      ];

      timeStats.forEach((stat, index) => {
        doc.setFont('helvetica', 'bold');
        doc.text(stat[0], col1X, yPos + (index * 7));
        doc.setFont('helvetica', 'normal');
        doc.text(stat[1], col1X + 55, yPos + (index * 7));
      });

      yPos += timeStats.length * 7 + 10;

      // === TABLA DE REGISTROS DETALLADOS ===
      doc.setFontSize(14);
      doc.setTextColor(52, 73, 94);
      doc.text('REGISTROS DETALLADOS', 15, yPos);

      yPos += 5;

      const tableData = records.map(record => [
        record.registrationNumber || '-',
        record.plate || '-',
        this.formatVehicleType(record.vehicleType),
        record.entryDate || '-',
        record.entryTime || '-',
        record.exitDate || '-',
        record.exitTime || '-',
        record.hoursParked?.toFixed(2) || '0',
        record.hoursToPay?.toFixed(2) || '0',
        `${record.currency || 'S/'}${record.amountPaid?.toFixed(2) || '0'}`,
        `${record.currency || 'S/'}${record.ratePerHour?.toFixed(2) || '0'}`,
        record.nightCharge ? `${record.currency || 'S/'}${record.nightCharge.toFixed(2)}` : '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [[
          'Nº Reg.',
          'Placa',
          'Tipo',
          'F. Entrada',
          'H. Entrada',
          'F. Salida',
          'H. Salida',
          'H. Parked',
          'H. Cobradas',
          'Monto',
          'Tarifa/h',
          'Cargo Noc.'
        ]],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 7,
          textColor: [44, 62, 80]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'center', cellWidth: 20 },
          2: { halign: 'center', cellWidth: 18 },
          3: { halign: 'center', cellWidth: 22 },
          4: { halign: 'center', cellWidth: 18 },
          5: { halign: 'center', cellWidth: 22 },
          6: { halign: 'center', cellWidth: 18 },
          7: { halign: 'right', cellWidth: 18 },
          8: { halign: 'right', cellWidth: 18 },
          9: { halign: 'right', cellWidth: 20 },
          10: { halign: 'right', cellWidth: 18 },
          11: { halign: 'right', cellWidth: 20 }
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { left: 15, right: 15 }
      });

      // Guardar el PDF
      const filename = `reporte-contabilidad-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      console.log('✅ PDF exportado exitosamente:', filename);
    });
  }

  /**
   * Exportar registros de contabilidad a Excel con estadísticas detalladas
   */
  exportToExcel(): void {
    this.accountingService.getAll().subscribe(records => {
      if (!records || records.length === 0) {
        alert('No hay datos para exportar');
        return;
      }

      const stats = this.calculateStatistics(records);
      const workbook = XLSX.utils.book_new();

      // === HOJA 1: ESTADÍSTICAS GENERALES ===
      const statsData = [
        ['REPORTE DE CONTABILIDAD - EASY PARK'],
        [`Generado el: ${new Date().toLocaleString('es-PE')}`],
        [],
        ['ESTADÍSTICAS GENERALES'],
        ['Total de Registros', stats.totalRecords],
        ['Ingresos Totales', `S/ ${stats.totalRevenue.toFixed(2)}`],
        ['Promedio de Estadía', `${stats.averageStayTime.toFixed(2)} horas`],
        ['Total Horas Estacionadas', `${stats.totalHoursParked.toFixed(2)} h`],
        ['Total Horas Cobradas', `${stats.totalHoursToPay.toFixed(2)} h`],
        ['Monto Promedio por Vehículo', `S/ ${stats.averageAmountPaid.toFixed(2)}`],
        ['Tarifa Promedio por Hora', `S/ ${stats.averageRatePerHour.toFixed(2)}`],
        ['Cargo Nocturno Total', `S/ ${stats.nightChargeTotal.toFixed(2)}`],
        [],
        ['ESTADÍSTICAS POR TIPO DE VEHÍCULO'],
        ['Tipo', 'Cantidad', 'Ingresos'],
        ['Autos/Camionetas', stats.vehiclesByType.cars, `S/ ${stats.revenueByType.cars.toFixed(2)}`],
        ['Motocicletas', stats.vehiclesByType.motorcycles, `S/ ${stats.revenueByType.motorcycles.toFixed(2)}`],
        [],
        ['ESTADÍSTICAS DE TIEMPO'],
        ['Máximo Tiempo de Estadía', `${stats.maxStayTime.toFixed(2)} horas`],
        ['Mínimo Tiempo de Estadía', `${stats.minStayTime.toFixed(2)} horas`]
      ];

      const wsStats = XLSX.utils.aoa_to_sheet(statsData);

      // Ajustar anchos de columna
      wsStats['!cols'] = [
        { wch: 35 },
        { wch: 20 }
      ];

      XLSX.utils.book_append_sheet(workbook, wsStats, 'Estadísticas');

      // === HOJA 2: REGISTROS DETALLADOS ===
      const detailedData = records.map(record => ({
        'Nº Registro': record.registrationNumber || '-',
        'Placa': record.plate || '-',
        'Tipo Vehículo': this.formatVehicleType(record.vehicleType),
        'Fecha Entrada': record.entryDate || '-',
        'Hora Entrada': record.entryTime || '-',
        'Fecha Salida': record.exitDate || '-',
        'Hora Salida': record.exitTime || '-',
        'Horas Estacionadas': record.hoursParked?.toFixed(2) || '0',
        'Horas a Cobrar': record.hoursToPay?.toFixed(2) || '0',
        'Monto Pagado': record.amountPaid?.toFixed(2) || '0',
        'Moneda': record.currency || 'S/',
        'Tarifa por Hora': record.ratePerHour?.toFixed(2) || '0',
        'Cargo Nocturno': record.nightCharge?.toFixed(2) || '0',
        'Fecha Operación': record.operationDate || '-',
        'ID Negocio': record.businessId || '-'
      }));

      const wsDetails = XLSX.utils.json_to_sheet(detailedData);

      // Ajustar anchos de columna
      wsDetails['!cols'] = [
        { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 13 }, { wch: 13 },
        { wch: 13 }, { wch: 13 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
        { wch: 8 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }
      ];

      XLSX.utils.book_append_sheet(workbook, wsDetails, 'Registros Detallados');

      // === HOJA 3: RESUMEN POR FECHA ===
      const revenueByDate = this.groupRevenueByDate(records);
      const dateData = revenueByDate.map(item => ({
        'Fecha': item.date,
        'Cantidad de Vehículos': item.count,
        'Ingresos Totales': `S/ ${item.revenue.toFixed(2)}`,
        'Promedio por Vehículo': `S/ ${(item.revenue / item.count).toFixed(2)}`
      }));

      const wsDateSummary = XLSX.utils.json_to_sheet(dateData);
      wsDateSummary['!cols'] = [
        { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 22 }
      ];

      XLSX.utils.book_append_sheet(workbook, wsDateSummary, 'Resumen por Fecha');

      // Guardar el archivo Excel
      const filename = `reporte-contabilidad-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);

      console.log('✅ Excel exportado exitosamente:', filename);
    });
  }

  /**
   * Calcular estadísticas detalladas de todos los registros
   */
  private calculateStatistics(records: AccountingRecordResource[]): ExportStatistics {
    const totalRecords = records.length;
    const totalRevenue = records.reduce((sum, r) => sum + (r.amountPaid || 0), 0);
    const totalHoursParked = records.reduce((sum, r) => sum + (r.hoursParked || 0), 0);
    const totalHoursToPay = records.reduce((sum, r) => sum + (r.hoursToPay || 0), 0);
    const nightChargeTotal = records.reduce((sum, r) => sum + (r.nightCharge || 0), 0);

    const averageStayTime = totalRecords > 0 ? totalHoursParked / totalRecords : 0;
    const averageAmountPaid = totalRecords > 0 ? totalRevenue / totalRecords : 0;

    const ratesSum = records.reduce((sum, r) => sum + (r.ratePerHour || 0), 0);
    const averageRatePerHour = totalRecords > 0 ? ratesSum / totalRecords : 0;

    // Calcular máximo y mínimo tiempo de estadía
    const hoursParkedArray = records.map(r => r.hoursParked || 0).filter(h => h > 0);
    const maxStayTime = hoursParkedArray.length > 0 ? Math.max(...hoursParkedArray) : 0;
    const minStayTime = hoursParkedArray.length > 0 ? Math.min(...hoursParkedArray) : 0;

    // Estadísticas por tipo de vehículo
    const carRecords = records.filter(r => this.isCarOrTruck(r.vehicleType));
    const motorcycleRecords = records.filter(r => this.isMotorcycle(r.vehicleType));

    const vehiclesByType = {
      cars: carRecords.length,
      motorcycles: motorcycleRecords.length
    };

    const revenueByType = {
      cars: carRecords.reduce((sum, r) => sum + (r.amountPaid || 0), 0),
      motorcycles: motorcycleRecords.reduce((sum, r) => sum + (r.amountPaid || 0), 0)
    };

    return {
      totalRecords,
      totalRevenue,
      averageStayTime,
      totalHoursParked,
      totalHoursToPay,
      vehiclesByType,
      revenueByType,
      averageAmountPaid,
      maxStayTime,
      minStayTime,
      nightChargeTotal,
      averageRatePerHour
    };
  }

  /**
   * Agrupar ingresos por fecha
   */
  private groupRevenueByDate(records: AccountingRecordResource[]): { date: string; revenue: number; count: number }[] {
    const grouped = records.reduce((acc: any, record) => {
      const date = record.operationDate || record.exitDate || record.entryDate;
      if (date) {
        if (!acc[date]) {
          acc[date] = { revenue: 0, count: 0 };
        }
        acc[date].revenue += record.amountPaid || 0;
        acc[date].count += 1;
      }
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, data]: [string, any]) => ({
        date,
        revenue: data.revenue,
        count: data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Obtener estadísticas para uso en componentes
   */
  getStatistics(): Observable<ExportStatistics> {
    return this.accountingService.getAll().pipe(
      map(records => this.calculateStatistics(records))
    );
  }

  private isMotorcycle(vehicleType: string): boolean {
    const type = vehicleType?.toString().toUpperCase();
    return type === 'MOTORCYCLE' || type === 'MOTO';
  }

  private isCarOrTruck(vehicleType: string): boolean {
    const type = vehicleType?.toString().toUpperCase();
    return type === 'CAR' || type === 'TRUCK' || type === 'AUTO-CAMIONETA';
  }

  private formatVehicleType(type: string): string {
    if (this.isMotorcycle(type)) return 'Motocicleta';
    if (this.isCarOrTruck(type)) return 'Auto/Camioneta';
    return type;
  }
}

