import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  logoLoaded: boolean = false;
  memoriaLoaded: boolean = false;
  buscadorLoaded: boolean = false;
}
