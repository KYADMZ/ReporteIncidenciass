import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Reporte, EstadoReporte, PrioridadReporte, CategoriaReporte } from '../../models/reporte';
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-tablero',
  imports: [FormsModule],
  templateUrl: './tablero.html',
  styleUrl: './tablero.css',
})
export class Tablero implements OnInit, OnDestroy {

  reportes: Reporte[] = [];
  problemaPersistente: boolean | null = null;
  private readonly subscriptions = new Subscription();

  filtroEstado: EstadoReporte | '' = '';
  filtroPrioridad: PrioridadReporte | '' = '';
  mostrarFormulario: boolean = false;
  cargando = true;
  guardando = false;
  errorMessage = '';

  titulo = '';
  descripcion = '';
  categoria: CategoriaReporte | '' = '';
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
   
    if (this.problemaPersistente === null) {
    alert('Debe responder la pregunta antes de crear el reporte.');
    return;
  }

  if (!this.problemaPersistente) {
    alert('Verifique que el problema persiste antes de crear un reporte.');
    return;
  }

    if (this.guardando) {
      return;
    }

    if (!this.titulo.trim() || this.titulo.trim().length < 3) {
      alert('El título debe tener al menos 3 caracteres.');
      return;
    }
    if (!this.descripcion.trim() || this.descripcion.trim().length < 5) {
      alert('La descripción debe tener al menos 5 caracteres.');
      return;
    }
    if (!this.categoria) {
      alert('Selecciona una categoría.');
      return;
    }

    this.guardando = true;
    this.errorMessage = '';
    this.subscriptions.add(this.reporteService.create({
      titulo: this.titulo.trim(),
      descripcion: this.descripcion.trim(),
      categoria: this.categoria,
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
    this.problemaPersistente = null;
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

  get FiltroReportes(): Reporte[] {
  return this.reportes.filter(reporte => {
    const coincideEstado =
      !this.filtroEstado ||
      reporte.estado === this.filtroEstado;

    const coincidePrioridad =
      !this.filtroPrioridad ||
      reporte.prioridad === this.filtroPrioridad;

    return coincideEstado && coincidePrioridad;
  });
}
}
