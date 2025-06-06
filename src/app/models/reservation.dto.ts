export interface ReservationDto {
  name: string;
  email: string;
  officialId: string;
  reservationDay: string; // YYYY-MM-DD
}

export interface IntervalReservationDto extends ReservationDto {
   name: string;
  email: string;
  idReservation: number;
  reservationIntervalDay: string;
}
