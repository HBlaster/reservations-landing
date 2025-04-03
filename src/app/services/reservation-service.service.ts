import { Injectable } from '@angular/core';
import {ReservationDto} from '../models/reservation.dto';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReservationServiceService {

  constructor(private http: HttpClient) { }

  createReservation(oReservation: ReservationDto){
    const url = 'http://localhost:5293/api/Reservation/registerReservation';
    return this.http.post(url, oReservation);
  }

}
