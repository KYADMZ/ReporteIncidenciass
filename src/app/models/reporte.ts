export type EstadoReporte = 'Nueva' | 'En Proceso' | 'Resuelta';
export type PrioridadReporte = 'Baja' | 'Media' | 'Alta';

export interface Reporte {
  id: number;
  titulo: string;
  descripcion: string;
  estado: EstadoReporte;
  prioridad: PrioridadReporte;
  fechaCreacion: Date;
}