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
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { RecaptchaModule, RecaptchaFormsModule } from 'ng-recaptcha';
import Swal from 'sweetalert2';

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
    MatSelectModule,
    RecaptchaModule,
    RecaptchaFormsModule,
  ],
  templateUrl: './reservation-form.component.html',
  styleUrl: './reservation-form.component.css',
})
export class ReservationFormComponent {
  selected = 'option2';
  validDays: number[] = [];
  holidays: string[] = [];
  contactForm: FormGroup;
  IntervalForm: FormGroup;
  capacityRemaining: number | undefined = undefined;
  intervalCapacity: any;

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
      recaptcha: ['', Validators.required],
    });

    this.IntervalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      idReservation: [0, Validators.required],
      reservationIntervalDay: ['', Validators.required],
      recaptcha: ['', Validators.required],
    });
  }

  typeOfReservation: any;

  ngOnInit() {
    this.reservationService.getReservationConfig().subscribe((data: any) => {
      console.log('Data: ', data);
      let dayMap: any = {
        SUN: 0,
        MON: 1,
        TUE: 2,
        WED: 3,
        THU: 4,
        FRI: 5,
        SAT: 6,
      };

      if (data.frequency === 'daily') {
        this.typeOfReservation = data.frequency;

        this.validDays = data.serviceDays.map((d: any) => dayMap[d.day]);

        this.holidays = (data.holidays || [])
          .filter((h: any) => !h.startTime && !h.endTime)
          .map((h: any) => new Date(h.date).toDateString()); // usamos toDateString para comparar sin hora
      } else if (data.frequency === 'interval') {
        this.typeOfReservation = data.frequency;
        this.validDays = data.serviceDays.map((d: any) => dayMap[d.day]);
        this.holidays = (data.holidays || [])
          .filter((h: any) => !h.startTime && !h.endTime)
          .map((h: any) => {
            const [year, month, day] = h.date.split('-').map(Number);
            return new Date(year, month - 1, day).toDateString();
          });
      }
    });
    this.contactForm.get('reservationDay')?.valueChanges.subscribe((date) => {
      if (date) {
        this.checkCapacity(date);
      }
    });
    this.IntervalForm.get('reservationIntervalDay')?.valueChanges.subscribe(
      (date) => {
        if (date) {
          this.checkCapacity(date);
        }
      }
    );
  }

  filterDates = (d: Date | null): boolean => {
    const date = d || new Date();
    const day = date.getDay();

    const isValidDay = this.validDays.includes(day);
    const isHoliday = this.holidays.includes(date.toDateString());

    return isValidDay && !isHoliday;
  };

  async onSubmit(): Promise<void> {
    if (this.typeOfReservation === 'daily') {
      if (this.contactForm.valid) {
        const recaptchaToken = this.contactForm.get('recaptcha')?.value;

        // Preparar objeto con recaptchaToken incluido
        const reservationData = {
          ...this.contactForm.value,
          recaptchaToken: recaptchaToken,
        };

        console.log('Datos daily reservation con reCAPTCHA:', reservationData);

        // Modifica processDailyReservation para que acepte reservationData si es necesario
        await this.processDailyReservation(reservationData);
      } else {
        const errors = generateFormErrors(this.contactForm);
        this.alertService.showFormErrors(errors);
      }
    }

    if (this.typeOfReservation === 'interval') {
      if (this.IntervalForm.valid) {
        const recaptchaToken = this.IntervalForm.get('recaptcha')?.value;

        const reservationData = {
          ...this.IntervalForm.value,
          recaptchaToken: recaptchaToken,
        };

        console.log('IntervalForm con reCAPTCHA:', reservationData);

        this.reservationService
          .createIntervalReservation(reservationData)
          .subscribe({
            next: (res: any) => {
              console.log('Interval reservation response: ', res);
              if (res.status === 'success') {
                Swal.fire({
                  icon: 'success',
                  title: 'Reservación creada',
                  text: 'Su reservación ha sido creada exitosamente.',
                });
                this.IntervalForm.reset();
                this.capacityRemaining = undefined;
              }
            },
            error: (err) => {
              console.error('Error creating interval reservation: ', err);
            },
          });
      } else {
        const errors = generateFormErrors(this.IntervalForm);
        this.alertService.showFormErrors(errors);
      }
    }
  }

  private async processDailyReservation(reservationData: any): Promise<void> {
    try {
      const res = await firstValueFrom(
        this.reservationService.createReservation(reservationData)
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
        reservationData.email,
        formattedDate,
        downloadCallback
      );

      this.contactForm.reset();
      this.capacityRemaining = undefined;
    } catch {
      this.alertService.showSubmissionError();
    }
  }

  checkCapacity(date: Date) {
    const formattedDate = date.toISOString().split('T')[0];
    this.reservationService
      .getAvailabilityByDate(formattedDate, this.typeOfReservation)
      .subscribe({
        next: (res: any) => {
          console.log('res checkCapacity: ', res);
          if (res.capacity < 0) {
            this.alertService.showWarning(
              'No hay lugares disponibles ese día.'
            );
            this.contactForm.get('reservationDay')?.setValue(null);
            return;
          }
          if (this.typeOfReservation === 'interval') {
            this.intervalCapacity = '';
            this.intervalCapacity = Array.isArray(res.capacity)
              ? res.capacity
              : [];

            return;
          }

          this.capacityRemaining = res.capacity;
          // console.log('capacity length: ', this.intervalCapacity.length);

          // if (this.capacityRemaining.length === 0) {
        },
        error: () => {
          this.alertService.showError(
            'No se pudo verificar la disponibilidad.'
          );
        },
      });
  }
  onCaptchaResolved(captchaResponse: string | null) {
    if (captchaResponse) {
      console.log('CAPTCHA resuelto con respuesta:', captchaResponse);
    } else {
      console.log('CAPTCHA no completado');
    }
  }
}
