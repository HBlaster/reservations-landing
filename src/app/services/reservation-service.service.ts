import { Injectable } from '@angular/core';
import { ReservationDto } from '../models/reservation.dto';
import { HttpClient } from '@angular/common/http';
import { ReservationResponse } from '../models/reservation.response';
import { environment } from '../../environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ReservationServiceService {
  constructor(private http: HttpClient,
    private fb: FormBuilder
  ) {
  }

  createReservation(oReservation: ReservationDto) {
    const url = `${environment.apiUrl}reservation`;
    return this.http.post<ReservationResponse>(url, oReservation);
  }

  generateDynamicForm(frequency:string): FormGroup {
    if (frequency === 'interval') {
      return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      officialId: ['', Validators.required],
      reservationDay: ['', Validators.required],
    });
    } else {
      return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      officialId: ['', Validators.required],
      reservationDay: ['', Validators.required],
    });
    }
  }

  getReservationConfig(){
    const url = `${environment.apiUrl}config-reservation/active-config`;
    return this.http.get(url);
  }

  getAvailabilityByDate(date: string, type: 'daily' | 'interval' = 'daily') {
  const formattedDate = new Date(date).toISOString().split('T')[0];
  const url = `${environment.apiUrl}config-reservation/availability/${formattedDate}?type=${type}`;
  return this.http.get(url);
}

}
