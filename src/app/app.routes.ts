import { Routes } from '@angular/router';
import { GetStatisticsComponent } from './components/get-statistics/get-statistics.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';
import { DailyAccountingComponent } from './components/daily-accounting/daily-accounting.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: GetStatisticsComponent, canActivate: [authGuard] },
  { path: 'dailyAccounting', component: DailyAccountingComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' },
];
