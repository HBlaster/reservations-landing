import { Injectable } from '@angular/core';
import { ReservationDto } from '../models/reservation.dto';
import { HttpClient } from '@angular/common/http';
import { ReservationResponse } from '../models/reservation.response';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReservationServiceService {
  constructor(private http: HttpClient) {}

  createReservation(oReservation: ReservationDto) {
    const url = `${environment.apiUrl}reservation`;
    return this.http.post<ReservationResponse>(url, oReservation);
  }

  getReservationConfig(){
    const url = `${environment.apiUrl}config-reservation/active-config`;
    return this.http.get(url);
  }
}
