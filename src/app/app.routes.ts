import { Routes } from '@angular/router';
import {HomeComponent} from '../app/components/home/home.component'
import {ReservationFormComponent} from '../app/components/reservation-form/reservation-form.component'

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'reservation', component: ReservationFormComponent},
];
