// src/controllers/budgetController.ts
import { supabase } from '../config/supabase';
import { UserBudget } from '../types/tables';

export const setMonthlyBudget = async (budgetData: Omit<UserBudget, 'is_active'>) => {
  const { data, error } = await supabase
    .from('user_budgets')
    .upsert({
      ...budgetData,
      is_active: true, // Default value
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getBudgetByUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_budgets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && !error.message.includes('No rows found')) {
    throw new Error(error.message);
  }
  return data;
};