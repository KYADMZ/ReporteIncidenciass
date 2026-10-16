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

  it('submits new reports through the API and displays their updated status', () => {
    const createButton = fixture.nativeElement.querySelector('.tablero-header button') as HTMLButtonElement;
    createButton.click();
    fixture.detectChanges(false);

    const title = fixture.nativeElement.querySelector('#titulo') as HTMLInputElement;
    const description = fixture.nativeElement.querySelector('#descripcion') as HTMLTextAreaElement;
    const category = fixture.nativeElement.querySelector('#categoria') as HTMLInputElement;
    title.value = 'Error de acceso';
    title.dispatchEvent(new Event('input'));
    description.value = 'No permite ingresar al sistema';
    description.dispatchEvent(new Event('input'));
    category.value = 'Sistema';
    category.dispatchEvent(new Event('input'));

    const form = fixture.nativeElement.querySelector('.formulario') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const request = httpTesting.expectOne('http://localhost:8000/api/reportes');
    expect(request.request.method).toBe('POST');
    request.flush({
      id: 7,
      titulo: 'Error de acceso',
      descripcion: 'No permite ingresar al sistema',
      categoria: 'Sistema',
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
      categoria: 'Sistema',
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
