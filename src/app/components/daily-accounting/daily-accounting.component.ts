import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RequestService } from '../../services/request.service';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DailyAccountingService } from '../../services/daily-accounting.service';
import { Datepicker } from 'flowbite';
import { ErrorService } from '../../services/error.service';
import { NotificationComponent } from '../notification/notification.component';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-daily-accounting',
  templateUrl: './daily-accounting.component.html',
  styleUrls: ['./daily-accounting.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, NotificationComponent], // Importaciones standalone
})
export class DailyAccountingComponent {
  private request = inject(RequestService);
  private dailyAccountingService = inject(DailyAccountingService);
  private router = inject(Router);
  private errorService = inject(ErrorService);
  private loaderService = inject(LoaderService);

  dailyAccountingForm: FormGroup;
  today_date: string = this.formatDateToSpanish(new Date());
  shops$!: Observable<any[]>;
  shops: any;
  shop_selected: string = "";
  amount_expense: number = 0;
  amount_income: number = 0;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.dailyAccountingForm = this.fb.group({
      shopId: ['', Validators.required],
      date: [this.today_date, [Validators.required, this.dateFormatValidator]],
      income: this.fb.array([]), // FormArray para ingresos
      expense: this.fb.array([]), // FormArray para gastos
    });
  }

  dateFormatValidator(control: AbstractControl): ValidationErrors | null {
    const datePattern = /^\d{2}-\d{2}-\d{4}$/; // Expresión regular para XX-XX-XXXX
    if (!control.value || datePattern.test(control.value)) {
      return null; // Válido si no hay valor (para campos opcionales) o si coincide con el patrón
    }
    return { invalidDateFormat: true }; // Devuelve un error si no coincide
  }

  ngAfterViewInit(): void {
    const datepickerInput = document.getElementById('datepicker-format-accounting');
    if (datepickerInput) {
      let datepicker = new Datepicker(datepickerInput, {
        format: 'dd-mm-yyyy', // Configuración del formato de fecha
        language: 'es', // Idioma español
        autohide: true,
      });

      datepickerInput.addEventListener('changeDate', this.onDateChange.bind(this));
    }
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.today_date = input.value;
    this.dailyAccountingForm.patchValue({ date: this.today_date });
  }

  calculateExpense(): void {
    const expenses = this.dailyAccountingForm.get('expense')?.value || [];
    this.amount_expense = expenses.reduce((total: number, expense: any) => total + (expense.amount || 0), 0);
  }

  calculateIncome(): void {
    const incomes = this.dailyAccountingForm.get('income')?.value || [];
    this.amount_income = incomes.reduce((total: number, income: any) => total + (income.amount || 0), 0);
  }

  formatDateToSpanish(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0'); // Día con 2 dígitos
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Mes con 2 dígitos
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Formato: DD/MM/YYYY
  }

  ngOnInit(): void {
    this.request.getShops().subscribe({
      next: (responses) => {
        this.shops = responses;
        this.setShop(this.shops[0].id, this.shops[0].name);
      },
      error: (error) => {
        const message = this.errorService.getErrorMessage(error.status, error.message);
        this.errorService.setErrorMessage(message);
      },
      complete: () => { },
    });
  }

  setShop(shopId: string, shopName: string): void {
    this.dailyAccountingForm.patchValue({ shopId });
    this.shop_selected = shopName;
  }

  // Getters para los FormArrays
  get income() {
    return this.dailyAccountingForm.get('income') as FormArray;
  }

  get expense() {
    return this.dailyAccountingForm.get('expense') as FormArray;
  }

  // Métodos para añadir elementos a los arrays
  addIncome() {
    const concept = this.income.length === 0 ? 'DIRECT_SALE' : 'EXTRA_SALE'; // Define el concepto según la posición
    this.income.push(
      this.fb.group({
        description: [''],
        amount: [0, [Validators.required, Validators.min(0)]],
        incoming_concept: [concept, [Validators.required, this.allowedValuesValidator(['DIRECT_SALE', 'EXTRA_SALE'])]],
      })
    );
  }

  addExpense() {
    const concept = this.expense.length === 0 ? 'DIRECT_BUY' : 'EXTRA_BUY'; // Define el concepto según la posición
    this.expense.push(
      this.fb.group({
        description: [''],
        amount: [0, [Validators.required, Validators.min(0)]],
        expensing_concept: [concept, [Validators.required, this.allowedValuesValidator(['DIRECT_BUY', 'EXTRA_BUY'])]],
      })
    );
  }

  allowedValuesValidator(allowedValues: string[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!allowedValues.includes(control.value)) {
        return { invalidValue: true }; // Error si el valor no está permitido
      }
      return null; // Es válido
    };
  }

  // Método para eliminar entradas
  removeIncome(index: number) {
    this.income.removeAt(index);
    this.calculateIncome();

    // Recalcular los conceptos
    this.reassignIncomeConcepts();
  }

  removeExpense(index: number) {
    this.expense.removeAt(index);
    this.calculateExpense();

    // Recalcular los conceptos
    this.reassignExpenseConcepts();
  }

  // Métodos para recalcular conceptos
  reassignIncomeConcepts() {
    this.income.controls.forEach((control, index) => {
      const concept = index === 0 ? 'DIRECT_SALE' : 'EXTRA_SALE';
      control.get('incoming_concept')?.setValue(concept, { emitEvent: false });
    });
  }

  reassignExpenseConcepts() {
    this.expense.controls.forEach((control, index) => {
      const concept = index === 0 ? 'DIRECT_BUY' : 'EXTRA_BUY';
      control.get('expensing_concept')?.setValue(concept, { emitEvent: false });
    });
  }

  // Método para enviar el formulario
  onSubmit() {
    if (this.dailyAccountingForm.valid) {
      const formData = this.dailyAccountingForm.value;

      // Convertir la fecha al formato ISO-8601
      const [day, month, year] = formData.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      formData.date = date.toISOString(); // Formato ISO-8601

      this.loaderService.show();
      this.dailyAccountingService.createDailyAccounting(formData).subscribe({
        next: (response) => {
          this.loaderService.hide();
          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.loaderService.hide();
          const message = this.errorService.getErrorMessage(error.status, error.message);
          this.errorService.setErrorMessage(message);
        },
      });
    } else {
      const message = this.errorService.getErrorMessage(0, 'El formulario es inválido');
      this.errorService.setErrorMessage(message);
    }
  }
}
