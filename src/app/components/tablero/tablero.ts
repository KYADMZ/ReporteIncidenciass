import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Reporte, EstadoReporte, PrioridadReporte } from '../../models/reporte';
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-tablero',
  imports: [FormsModule],
  templateUrl: './tablero.html',
  styleUrl: './tablero.css',
})
export class Tablero implements OnInit, OnDestroy {

  reportes: Reporte[] = [];
  private readonly subscriptions = new Subscription();

  mostrarFormulario: boolean = false;
  cargando = true;
  guardando = false;
  errorMessage = '';

  titulo = '';
  descripcion = '';
  categoria = '';
  prioridad: PrioridadReporte = 'Media';

  readonly estados: EstadoReporte[] = ['Nueva', 'En Proceso', 'Resuelta'];

  constructor(
    private readonly reporteService: ReporteService,
    private readonly changeDetector: ChangeDetectorRef
  ) {
    afterNextRender(() => this.loadReports());
  }

  ngOnInit(): void {
    this.subscriptions.add(this.reporteService.reportes$.subscribe(reportes => {
      this.reportes = reportes;
      this.changeDetector.markForCheck();
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  StatusGet(status: EstadoReporte): Reporte[] {
    return this.reportes
      .filter(reporte => reporte.estado === status)
      .sort((first, second) => this.priorityRank(second.prioridad) - this.priorityRank(first.prioridad));
  }
  
  CreateReport(): void {
    if (!this.titulo.trim() || this.titulo.trim().length < 3 ||
        !this.descripcion.trim() || this.descripcion.trim().length < 5 ||
        !this.categoria.trim() || this.guardando) {
      alert('Por favor, complete todos los campos antes de crear un reporte.');
      return;
    }

    this.guardando = true;
    this.errorMessage = '';
    this.subscriptions.add(this.reporteService.create({
      titulo: this.titulo.trim(),
      descripcion: this.descripcion.trim(),
      categoria: this.categoria.trim(),
      prioridad: this.prioridad
    }).subscribe({
      next: () => {
        this.limpiarFormulario();
        this.mostrarFormulario = false;
        this.guardando = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(error, 'No se pudo guardar el reporte. Verifica que el servidor esté disponible.');
        this.guardando = false;
        this.changeDetector.markForCheck();
      }
    }));
  }

  updateStatus(id: number, evento: Event): void {
    const select = evento.target as HTMLSelectElement;
    const status = select.value as EstadoReporte;
    this.errorMessage = '';
    this.subscriptions.add(this.reporteService.updateState(id, status).subscribe({
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(error, 'No se pudo actualizar el estado del reporte.');
        this.changeDetector.markForCheck();
      }
    }));
  }

  deleteReport(id: number): void {
    if(confirm('¿Está seguro de que desea eliminar este reporte?')) {
      this.errorMessage = '';
      this.subscriptions.add(this.reporteService.delete(id).subscribe({
        error: (error: HttpErrorResponse) => {
          this.errorMessage = this.getErrorMessage(error, 'No se pudo eliminar el reporte.');
          this.changeDetector.markForCheck();
        }
      }));
    }
  }

  loadReports(): void {
    this.cargando = true;
    this.errorMessage = '';
    this.subscriptions.add(this.reporteService.load().subscribe({
      next: () => {
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = this.getErrorMessage(error, 'No se pudieron cargar los reportes. Verifica que el backend esté ejecutándose en http://localhost:8000.');
        this.cargando = false;
        this.changeDetector.markForCheck();
      }
    }));
  }
  
  limpiarFormulario(): void {
    this.titulo = '';
    this.descripcion = '';
    this.categoria = '';
    this.prioridad = 'Media';
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const detail = error.error?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      const messages = detail
        .map((item: { msg?: string }) => item.msg)
        .filter((message): message is string => Boolean(message));
      if (messages.length > 0) return messages.join(' ');
    }
    return fallback;
  }

  private priorityRank(priority: PrioridadReporte): number {
    switch (priority) {
      case 'Alta': return 3;
      case 'Media': return 2;
      case 'Baja': return 1;
    }
  }
}
