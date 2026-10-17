import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ReporteService } from './reporte.service';

describe('ReporteService', () => {
  let service: ReporteService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ReporteService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('loads database categories that are not in the current form options', () => {
    let loadedCategory = '';
    service.load().subscribe((reports) => loadedCategory = reports[0].categoria);

    httpTesting.expectOne('http://localhost:8000/api/reportes').flush([{
      id: 12,
      titulo: 'Reporte anterior',
      descripcion: 'Creado antes de agregar las nuevas categorías',
      categoria: 'Computacion',
      estado: 'Nueva',
      prioridad: 'Media',
      fecha_creacion: '2026-10-16T20:00:00'
    }]);

    expect(loadedCategory).toBe('Computacion');
  });

  afterEach(() => httpTesting.verify());
});
