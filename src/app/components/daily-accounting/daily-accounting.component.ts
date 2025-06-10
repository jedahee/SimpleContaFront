import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule, NotificationComponent],
})
export class DailyAccountingComponent {
  private request = inject(RequestService);
  private dailyAccountingService = inject(DailyAccountingService);
  private router = inject(Router);
  private errorService = inject(ErrorService);
  private loaderService = inject(LoaderService);
  private route = inject(ActivatedRoute);

  dailyAccountingForm: FormGroup;
  today_date: string = this.formatDateToSpanish(new Date());
  shops$!: Observable<any[]>;
  shops: any;
  shop_selected: string = "";
  amount_expense: number = 0;
  amount_income: number = 0;
  isEditMode: boolean = false;
  accountingId: string  = '';
  title: string = '';
  from: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.dailyAccountingForm = this.fb.group({
      shopId: ['', Validators.required],
      date: [this.today_date, [Validators.required, this.dateFormatValidator]],
      income: this.fb.array([]),
      expense: this.fb.array([]),
    });
  }

  dateFormatValidator(control: AbstractControl): ValidationErrors | null {
    const datePattern = /^\d{2}-\d{2}-\d{4}$/;
    if (!control.value || datePattern.test(control.value)) {
      return null;
    }
    return { invalidDateFormat: true };
  }

  ngAfterViewInit(): void {
    const datepickerInput = document.getElementById('datepicker-format-accounting');
    if (datepickerInput) {
      let datepicker = new Datepicker(datepickerInput, {
        format: 'dd-mm-yyyy',
        language: 'es',
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
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.accountingId = params.get('id') ?? '';
      console.log(this.accountingId)
      this.isEditMode = !!this.accountingId;
      if (this.isEditMode) {
        this.loadAccountingData(this.accountingId);
        this.title = "Editar";
      } else {
        this.title = "Crear";
      }
    });

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

  loadAccountingData(id: string): void {
    this.dailyAccountingService.getDailyAccounting(id).subscribe({
      next: (data) => {
        this.setShop(data.shopId, data.shopName);
        this.today_date = this.formatDateToSpanish(new Date(data.date));
        this.dailyAccountingForm.patchValue({ date: this.today_date });


        console.log(data)

        // Añadir ingresos
        data.listOfIncomes.forEach((income: any) => {
          const incomeGroup = this.fb.group({
            description: [income.description],
            amount: [income.amount, [Validators.required, Validators.min(0)]],
            incoming_concept: [income.incoming_concept, [Validators.required, this.allowedValuesValidator(['DIRECT_SALE', 'EXTRA_SALE'])]],
          });
          this.income.push(incomeGroup);
          this.calculateIncome();
          this.reassignIncomeConcepts();
        });


        // Añadir gastos
        data.listOfExpenses.forEach((expense: any) => {
          const expenseGroup = this.fb.group({
            description: [expense.description],
            amount: [expense.amount, [Validators.required, Validators.min(0)]],
            expensing_concept: [expense.expensing_concept, [Validators.required, this.allowedValuesValidator(['DIRECT_BUY', 'EXTRA_BUY'])]],
          });
          this.expense.push(expenseGroup);
          this.calculateExpense();
          this.reassignExpenseConcepts();
        });
      },
      error: (error) => {
        const message = this.errorService.getErrorMessage(error.status, error.message);
        this.errorService.setErrorMessage(message);
      }
    });
  }

  setShop(shopId: string, shopName: string): void {
    this.dailyAccountingForm.patchValue({ shopId });
    this.shop_selected = shopName;
  }

  get income() {
    return this.dailyAccountingForm.get('income') as FormArray;
  }

  get expense() {
    return this.dailyAccountingForm.get('expense') as FormArray;
  }

  addIncome() {
    const concept = this.income.length === 0 ? 'DIRECT_SALE' : 'EXTRA_SALE';
    const incomeGroup = this.fb.group({
      description: [''],
      amount: [0, [Validators.required, Validators.min(0)]],
      incoming_concept: [concept, [Validators.required, this.allowedValuesValidator(['DIRECT_SALE', 'EXTRA_SALE'])]],
    });

    this.income.push(incomeGroup);
  }

  addExpense() {
    const concept = this.expense.length === 0 ? 'DIRECT_BUY' : 'EXTRA_BUY';
    const expenseGroup = this.fb.group({
      description: [''],
      amount: [0, [Validators.required, Validators.min(0)]],
      expensing_concept: [concept, [Validators.required, this.allowedValuesValidator(['DIRECT_BUY', 'EXTRA_BUY'])]],
    });

    this.expense.push(expenseGroup);
  }

  allowedValuesValidator(allowedValues: string[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!allowedValues.includes(control.value)) {
        return { invalidValue: true };
      }
      return null;
    };
  }

  removeIncome(index: number) {
    this.income.removeAt(index);
    this.calculateIncome();
    this.reassignIncomeConcepts();
  }

  removeExpense(index: number) {
    this.expense.removeAt(index);
    this.calculateExpense();
    this.reassignExpenseConcepts();
  }

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

  // Método mejorado para preparar los datos antes del envío
  private prepareFormData(formValue: any): any {
    // Crear una copia profunda de los datos del formulario
    const preparedData = JSON.parse(JSON.stringify(formValue));

    // Convertir la fecha al formato ISO-8601
    const [day, month, year] = preparedData.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    preparedData.date = date.toISOString();

    // Asegurar que los arrays de income y expense mantengan sus conceptos
    preparedData.income = preparedData.income.map((income: any, index: number) => ({
      ...income,
      incoming_concept: income.incoming_concept || (index === 0 ? 'DIRECT_SALE' : 'EXTRA_SALE')
    }));

    preparedData.expense = preparedData.expense.map((expense: any, index: number) => ({
      ...expense,
      expensing_concept: expense.expensing_concept || (index === 0 ? 'DIRECT_BUY' : 'EXTRA_BUY')
    }));

    return preparedData;
  }

  onSubmit() {
    if (this.dailyAccountingForm.valid) {
      const rawFormData = this.dailyAccountingForm.value;
      const formData = this.prepareFormData(rawFormData);

      this.loaderService.show();
      if (this.isEditMode) {
        this.dailyAccountingService.updateDailyAccounting(this.accountingId, formData).subscribe({
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
      }
    } else {
      const message = this.errorService.getErrorMessage(0, 'El formulario es inválido');
      this.errorService.setErrorMessage(message);
    }
  }
}
