
export interface Transaction {
  amount: number;
  description: string;
  type: 'income' | 'expense';
  incomingConcept?: string; // Solo para ingresos
  expensingConcept?: string; // Solo para gastos
}

export interface IAddAcounting {
  shopId: string;
  date: string; // Fecha en formato ISO
  dailyExpense: number;
  dailyIncome: number;
  dailyProfit: number;
  shop: string;
  listOfIncomes: {
    amount: number;
    incomingConcept: string;
    description: string;
  }[];
  listOfExpenses: {
    amount: number;
    expensingConcept: string;
    description: string;
  }[];
}
