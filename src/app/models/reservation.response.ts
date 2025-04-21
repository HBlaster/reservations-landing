export interface ReservationResponse {
  message: string;
  data: ReservationData;
}

export interface ReservationData {
  id: string;
  name: string;
  email: string;
  officialId: string;
  reservationDay: string;  // o Date si lo parseas
  qrString: string;
  createdAt: string;       // o Date si lo parseas
  status: string | null;
  notes: string | null;
  checkedInAt: string | null;
}
