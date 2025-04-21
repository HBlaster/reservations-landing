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

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.css',
})
export class ReservationFormComponent {
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
