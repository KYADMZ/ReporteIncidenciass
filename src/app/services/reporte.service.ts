import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Reporte, EstadoReporte, PrioridadReporte } from '../models/reporte';

interface ReporteApi {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: string;
  prioridad: string;
  fecha_creacion: string | null;
}

type DatosReporte = Omit<Reporte, 'id' | 'estado' | 'fechaCreacion'>;

const API_URL = 'http://localhost:8000/api/reportes';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private readonly reportesSubject = new BehaviorSubject<Reporte[]>([]);
  readonly reportes$ = this.reportesSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  load(): Observable<Reporte[]> {
    return this.http.get<ReporteApi[]>(API_URL).pipe(
      map((reportes) => reportes.map((reporte) => this.fromApi(reporte))),
      tap((reportes) => this.reportesSubject.next(reportes))
    );
  }

  create(datos: DatosReporte): Observable<Reporte> {
    return this.http.post<ReporteApi>(API_URL, datos).pipe(
      map((reporte) => this.fromApi(reporte)),
      tap((reporte) => this.reportesSubject.next([reporte, ...this.reportesSubject.value]))
    );
  }

  updateState(id: number, nuevoEstado: EstadoReporte): Observable<Reporte> {
    return this.http.patch<ReporteApi>(`${API_URL}/${id}`, { estado: nuevoEstado }).pipe(
      map((reporte) => this.fromApi(reporte)),
      tap((updated) => this.reportesSubject.next(
        this.reportesSubject.value.map((reporte) => reporte.id === updated.id ? updated : reporte)
      ))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(
      tap(() => this.reportesSubject.next(
        this.reportesSubject.value.filter((reporte) => reporte.id !== id)
      ))
    );
  }

  private fromApi(reporte: ReporteApi): Reporte {
    return {
      id: reporte.id,
      titulo: reporte.titulo,
      descripcion: reporte.descripcion,
      categoria: reporte.categoria,
      estado: this.fromApiStatus(reporte.estado),
      prioridad: this.fromApiPriority(reporte.prioridad),
      fechaCreacion: reporte.fecha_creacion ? new Date(reporte.fecha_creacion) : new Date()
    };
  }

  private fromApiStatus(status: string): EstadoReporte {
    switch (status) {
      case 'Nueva': return 'Nueva';
      case 'En Proceso':
      case 'En progreso': return 'En Proceso';
      case 'Resuelta':
      case 'Cerrada': return 'Resuelta';
      default: throw new Error(`Estado de reporte no reconocido: ${status}`);
    }
  }

  private fromApiPriority(priority: string): PrioridadReporte {
    switch (priority) {
      case 'Alta':
      case 'Baja':
      case 'Media': return priority;
      default: throw new Error(`Prioridad de reporte no reconocida: ${priority}`);
    }
  }
}
