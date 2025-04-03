export interface ReservationDto {
    name: string;
    email: string;
    officialId: string;
    reservationDay: string; // ISO string format para compatibilidad con DateTime de .NET
  }  