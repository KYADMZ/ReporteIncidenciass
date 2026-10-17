export type EstadoReporte = 'Nueva' | 'En Proceso' | 'Resuelta';
export type CategoriaReporte = 'Equipo no enciende/Inicia' | 'Fallo de aplicación' | 'Equipo lento' | 'Problemas de inicio de sesión' | 'Otros';
export type PrioridadReporte = 'Baja' | 'Media' | 'Alta';

export interface Reporte {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: EstadoReporte;
  prioridad: PrioridadReporte;
  fechaCreacion: Date;
}