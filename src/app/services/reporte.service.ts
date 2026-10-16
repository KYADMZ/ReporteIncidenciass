import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Reporte, EstadoReporte } from '../models/reporte';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private reportesSubject = new BehaviorSubject<Reporte[]>([]);
   reportes$ = this.reportesSubject.asObservable();

   private siguienteId = 1;
   
   create(datos: Omit<Reporte, 'id' | 'estado' | 'fechaCreacion'>): void {
     const nuevoReporte: Reporte = {
       id: this.siguienteId++,
       titulo: datos.titulo,
       descripcion: datos.descripcion,
       estado: 'Nueva',
       prioridad: datos.prioridad,
       fechaCreacion: new Date()
     };
 
     this.reportesSubject.next([nuevoReporte, ...this.reportesSubject.value]);
   }

   updateState(id: number, nuevoEstado: EstadoReporte): void {
       const updated = this.reportesSubject.value.map(reporte =>
         reporte.id === id ? { ...reporte, estado: nuevoEstado } : reporte
       );
       this.reportesSubject.next(updated);
   }

   delete(id: number): void {
       const updated = this.reportesSubject.value.filter(reporte => reporte.id !== id);
       this.reportesSubject.next(updated);
   }

}