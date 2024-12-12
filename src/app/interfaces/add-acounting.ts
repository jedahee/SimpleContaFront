export interface IAddAcounting {
  shopId: string;
  income: {
    id: number;
    amount: number;
    incomingConcept: string;
    description: string;
  }[];
  expense: {
    id: number;
    amount: number;
    expensingConcept: string;
    description: string;
  }[];
  date: string;
}
