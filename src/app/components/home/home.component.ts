import {
  Component,
  ElementRef,
  ViewChild,
  HostListener,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import { Router } from '@angular/router';
import { ReservationFormComponent } from "../reservation-form/reservation-form.component";


@Component({
  selector: 'app-home',
  standalone: true, // ← para que sea un componente independiente
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [ReservationFormComponent],   // ← plural, en array
})
export class HomeComponent implements AfterViewInit {
  /* ---------- refs del template ---------- */
  @ViewChild('header') header!: ElementRef<HTMLElement>;
  @ViewChild('burger') burger!: ElementRef<HTMLElement>;
  @ViewChild('sideMenu') sideMenu!: ElementRef<HTMLElement>;
  @ViewChild('prSection') prSection!: ElementRef<HTMLElement>;

  /* ---------- estado ---------- */
  isMenuOpen = false;
  private prOffsetTop = 0;

  constructor(private router: Router, private rd: Renderer2) {}

  /* ---------- ciclo de vida ---------- */
  ngAfterViewInit(): void {
    this.prOffsetTop = this.prSection.nativeElement.offsetTop;
    this.updateHeaderTransparency();
  }

  /* ---------- scroll ---------- */
  @HostListener('window:scroll')
  onScroll(): void {
    this.updateHeaderTransparency();
  }

  /* ---------- burger ---------- */
  toggleBurger(): void {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      this.rd.addClass(this.burger.nativeElement, 'abierto');
      this.rd.addClass(this.sideMenu.nativeElement, 'abierto');
    } else {
      this.rd.removeClass(this.burger.nativeElement, 'abierto');
      this.rd.removeClass(this.sideMenu.nativeElement, 'abierto');
    }
  }

  /* ---------- smooth scroll ---------- */
  scrollTo(el: HTMLElement): void {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- helper ---------- */
  private updateHeaderTransparency(): void {
    const y = window.scrollY;
    if (y >= this.prOffsetTop) {
      this.rd.removeClass(this.header.nativeElement, 'transparente');
    } else {
      this.rd.addClass(this.header.nativeElement, 'transparente');
    }
  }

  /* ---------- navegación al form ---------- */
  reservationClicked(): void {
    this.router.navigate(['/reservation']);
  }
}
