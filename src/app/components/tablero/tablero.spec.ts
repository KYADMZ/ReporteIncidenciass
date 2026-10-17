import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tablero } from './tablero';

describe('Tablero', () => {
  let component: Tablero;
  let fixture: ComponentFixture<Tablero>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tablero],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Tablero);
    component = fixture.componentInstance;
    httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges(false);
    httpTesting.expectOne('http://localhost:8000/api/reportes').flush([]);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submits a selected category and displays the report status returned by the API', () => {
    const createButton = fixture.nativeElement.querySelector('.tablero-header button') as HTMLButtonElement;
    createButton.click();
    fixture.detectChanges(false);

    component.titulo = 'Error de acceso';
    component.descripcion = 'No permite ingresar al sistema';
    component.categoria = 'Fallo de aplicación';
    component.CreateReport();

    const request = httpTesting.expectOne('http://localhost:8000/api/reportes');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      titulo: 'Error de acceso',
      descripcion: 'No permite ingresar al sistema',
      categoria: 'Fallo de aplicación',
      prioridad: 'Media'
    });
    request.flush({
      id: 7,
      titulo: 'Error de acceso',
      descripcion: 'No permite ingresar al sistema',
      categoria: 'Fallo de aplicación',
      prioridad: 'Media',
      estado: 'Nueva',
      fecha_creacion: '2026-10-16T20:00:00'
    });
    fixture.detectChanges(false);

    expect(component.StatusGet('Nueva').map((report) => report.titulo)).toEqual(['Error de acceso']);
    expect(fixture.nativeElement.textContent).toContain('Error de acceso');
    expect(component.mostrarFormulario).toBe(false);

    const status = fixture.nativeElement.querySelector('#estado-7') as HTMLSelectElement;
    status.value = 'En Proceso';
    status.dispatchEvent(new Event('change'));
    const patch = httpTesting.expectOne('http://localhost:8000/api/reportes/7');
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ estado: 'En Proceso' });
    patch.flush({
      id: 7,
      titulo: 'Error de acceso',
      descripcion: 'No permite ingresar al sistema',
      categoria: 'Fallo de aplicación',
      prioridad: 'Media',
      estado: 'En Proceso',
      fecha_creacion: '2026-10-16T20:00:00'
    });
    fixture.detectChanges(false);

    expect(component.StatusGet('En Proceso').map((report) => report.titulo)).toEqual(['Error de acceso']);
    expect(fixture.nativeElement.querySelector('#estado-7').value).toBe('En Proceso');
  });

  afterEach(() => httpTesting.verify());
});
