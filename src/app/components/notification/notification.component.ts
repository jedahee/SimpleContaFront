import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorService } from '../../services/error.service';

@Component({
  selector: 'app-notification',
  imports: [],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
  standalone: true
})
export class NotificationComponent {
  errorMessage: string | null = null;
  private errorSubscription: Subscription | null = null;

  constructor(
    private errorService: ErrorService
  ) {}

  ngOnInit(): void {
    this.errorSubscription = this.errorService.errorMessage$.subscribe((message) => {
      this.errorMessage = message;
    });
  }

  ngOnDestroy(): void {
    this.errorSubscription?.unsubscribe();
  }

  // Optionally, clear the error
  clearError() {
    this.errorService.clearErrorMessage();
  }
}
