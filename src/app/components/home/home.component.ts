import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
} from '@angular/forms';
import {ReservationFormComponent} from '../reservation-form/reservation-form.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, ReservationFormComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {

  condiciones: boolean = true;
  constructor(private router: Router) {
    
  }
  ngOnInit() {}

  
  reservationClicked() {
    this.router.navigate(['/reservation']);
  }
}
