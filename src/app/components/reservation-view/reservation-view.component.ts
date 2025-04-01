import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reservation-view',
  standalone: true,
  imports: [],
  templateUrl: './reservation-view.component.html',
  styleUrl: './reservation-view.component.css'
})
export class ReservationViewComponent {

  constructor(private router: Router) { }

  reservationClicked(){
    this.router.navigate(['/reservation']);
  }

}
