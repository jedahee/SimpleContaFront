import { Component, inject } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: true, // Este es clave

})
export class HeaderComponent {
  private request = inject(RequestService);
  private authService = inject(AuthService);
  actual_site_text = "Cuentas globales"
  router = inject(Router);

  shops$!: Observable<any[]>;
  shops: any;

  constructor() {}

  ngOnInit(): void {
    // Realiza la primera petición para obtener los shops
    this.shops$ = this.request.getShops();

  }

  changeActualSite(text:string) {
    this.actual_site_text = text;
  }

  logout() {
    this.authService.logout()
    this.router.navigate(['/login'])
  }
}
