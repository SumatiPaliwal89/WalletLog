export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
}

export type ExpenseCategory = 'food' | 'transport' | 'education' | 'entertainment' | 'ameneties' | 'rent' | 'other';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  description?: string;
  expense_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ExpenseReceipt {
  id: string;
  expense_id: string;
  storage_path: string;
  file_size: number;
  mime_type: 'image/jpeg' | 'image/png' | 'application/pdf';
  ocr_text?: string;
  uploaded_at: Date;
}

export interface UserBudget {
  user_id: string;
  monthly_limit: number;
  reset_day: number;
  alert_threshold: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
