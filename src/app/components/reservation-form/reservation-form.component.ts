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
  validDays: number[] = [];
  holidays: string[] = [];
  contactForm: FormGroup;
  capacityRemaining: number | undefined = undefined;

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
      if (data.frequency === 'daily') {
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

        this.holidays = (data.holidays || [])
          .filter((h: any) => !h.startTime && !h.endTime)
          .map((h: any) => new Date(h.date).toDateString()); // usamos toDateString para comparar sin hora
      } else if (data.frequency === 'interval') {
        this.typeOfReservation = data.frequency;
      }
    });
    this.contactForm.get('reservationDay')?.valueChanges.subscribe((date) => {
      if (date) {
        this.checkCapacity(date);
      }
    });
  }

  filterDates = (d: Date | null): boolean => {
    const date = d || new Date();
    const day = date.getDay();

    const isValidDay = this.validDays.includes(day);
    const isHoliday = this.holidays.includes(date.toDateString());

    return isValidDay && !isHoliday;
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

  checkCapacity(date: Date) {
    const formattedDate = date.toISOString().split('T')[0];
    this.reservationService.getAvailabilityByDate(formattedDate).subscribe({
      next: (res: any) => {
        console.log("res checkCapacity: ",res);
        this.capacityRemaining = res.capacity;
        if (res.capacity <= 0) {
          this.alertService.showWarning('No hay lugares disponibles ese día.');
          this.contactForm.get('reservationDay')?.setValue(null); 
        }
      },
      error: () => {
        this.alertService.showError('No se pudo verificar la disponibilidad.');
      },
    });
  }
}
