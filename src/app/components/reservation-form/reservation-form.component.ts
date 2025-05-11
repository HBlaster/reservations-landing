import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ReservationServiceService } from '../../services/reservation-service.service';
import { QrService } from '../../services/qr-service.service';
import { AlertService } from '../../services/alert-service.service';
import { generateFormErrors } from '../../utils/form-error.util';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
  ],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.css',
})
export class ReservationFormComponent {
  validDays: number[] = []; // días permitidos, ej. [1, 2, 3] para lunes-miércoles

  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationServiceService,
    private qrService: QrService,
    private alertService: AlertService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      officialId: ['', Validators.required],
      reservationDay: ['', Validators.required],
    });
  }

  typeOfReservation: any;

  ngOnInit() {
    this.reservationService.getReservationConfig().subscribe((data: any) => {
      if (data) {
        console.log(data);
        this.typeOfReservation = data.frequency;

        const dayMap: any = {
        SUN: 0,
        MON: 1,
        TUE: 2,
        WED: 3,
        THU: 4,
        FRI: 5,
        SAT: 6,
      };

      this.validDays = data.serviceDays.map((d: any) => dayMap[d.day]);
      }
    });
  }

  filterDates = (d: Date | null): boolean => {
  const date = d || new Date();
  const day = date.getDay(); // 0 (domingo) - 6 (sábado)
  return this.validDays.includes(day); // permite solo si el día está en la lista
};


  async onSubmit(): Promise<void> {
    if (this.contactForm.valid) {
      await this.processReservation();
    } else {
      const errors = generateFormErrors(this.contactForm);
      this.alertService.showFormErrors(errors);
    }
  }

  private async processReservation(): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.reservationService.createReservation(this.contactForm.value)
      );

      const qrUrl = await this.qrService.generateQRDataURL(res.data.qrString);
      const formattedDate = res.data.reservationDay
        .replace('T', ' ')
        .replace('Z', '');

      const downloadCallback = async () => {
        const image = await this.qrService.generateCanvasImage(
          qrUrl,
          formattedDate
        );
        const link = document.createElement('a');
        link.href = image;
        link.download = `reservation_${Date.now()}.png`;
        link.click();
      };

      await this.alertService.showConfirmationWithQR(
        qrUrl,
        this.contactForm.value.email,
        formattedDate,
        downloadCallback
      );

      this.contactForm.reset();
    } catch {
      this.alertService.showSubmissionError();
    }
  }
}
