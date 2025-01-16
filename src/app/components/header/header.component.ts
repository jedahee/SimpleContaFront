import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: true, // Este es clave

})
export class HeaderComponent {
  @Output() shopChange = new EventEmitter<any>(); // Emisor del evento
  @Output() shopsExport = new EventEmitter<any>(); // Emisor del evento
  @Output() closeSidebar = new EventEmitter<any>(); // Emisor del evento

  @Input() isOpen: boolean = true;
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
    this.shopsExport.emit(this.shops$);
  }

  emitShop(text:string, shop:any) {
    this.actual_site_text = text;
    this.shopChange.emit(shop); // Emitir el UUID
  }

  closeMenu() {
    this.isOpen = false;
    this.closeSidebar.emit(this.isOpen)
  }

  logout() {
    this.authService.logout()
    this.router.navigate(['/login'])
  }
}
