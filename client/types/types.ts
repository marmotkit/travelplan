export interface TravelPlan {
  _id?: string;
  title: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'scheduled' | 'ongoing' | 'completed';
  description?: string;
  accommodation?: Accommodation[];
  budget?: Budget;
  essentials?: string[];
  notes?: string[];
  photos?: Photo[];
}

export interface Accommodation {
  name: string;
  address: string;
  checkIn: Date;
  checkOut: Date;
  price: number;
  notes?: string;
}

export interface Budget {
  estimatedTotal: number;
  actualTotal?: number;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  name: string;
  amount: number;
  actual?: number;
}

export interface Photo {
  url: string;
  description?: string;
  date: Date;
}