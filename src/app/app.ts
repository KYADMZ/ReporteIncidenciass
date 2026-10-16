import { Component } from '@angular/core';
import { Tablero } from './components/tablero/tablero';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ Tablero],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
