import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {ReservationFormComponent} from'../reservation-form/reservation-form.component';

@Component({
  selector: 'app-reservation-view',
  standalone: true,
  imports: [ReservationFormComponent],
  templateUrl: './reservation-view.component.html',
  styleUrl: './reservation-view.component.css'
})
export class ReservationViewComponent {

  constructor(private router: Router) { }

  reservationClicked(){
    this.router.navigate(['/reservation']);
  }

}
