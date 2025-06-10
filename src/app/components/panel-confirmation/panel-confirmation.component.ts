import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-panel-confirmation',
  imports: [CommonModule],
  templateUrl: './panel-confirmation.component.html',
  styleUrl: './panel-confirmation.component.css'
})
export class PanelConfirmationComponent {
  @Input() shop: string = '';
  @Input() date: string = '';
  @Input() panelActive: boolean = true; // Para manejar el estado del panel de confirmación
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  confirmAction() {
    this.confirm.emit();
  }

  cancelAction() {
    this.cancel.emit();
  }

}
