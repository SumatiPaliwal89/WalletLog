// src/controllers/expenseController.ts
import { supabase } from '../config/supabase';
import { Expense, ExpenseReceipt } from '../types/tables';
import { v4 as uuidv4 } from 'uuid';

interface CreateExpenseParams {
  expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>;
  receipt?: Express.Multer.File;
}

export const createExpense = async ({ expense, receipt }: CreateExpenseParams) => {
  const expenseId = uuidv4();
  const now = new Date().toISOString();

  // Begin: Prepare expense payload
  const newExpense = {
    ...expense,
    id: expenseId,
    created_at: now,
    updated_at: now,
  };

  try {
    // 1. Insert expense
    const { error: insertError } = await supabase
      .from('expenses')
      .insert(newExpense);

    if (insertError) {
      console.error('Error inserting expense:', insertError);
      throw new Error('Failed to create expense');
    }

    if (receipt?.buffer) {
      const safeFileName = receipt.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const receiptPath = `user_${expense.user_id}/${expenseId}/${safeFileName}`;

      // Convert buffer to Blob for Supabase
      const blob = new Blob([receipt.buffer], { type: receipt.mimetype });

      // Upload with error handling
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(receiptPath, blob, {
          contentType: receipt.mimetype,
          upsert: false,
          cacheControl: '3600', // 1 hour cache
        });

      if (uploadError) {
        throw new Error(`Upload Failed: ${uploadError.message}`);
      }

      // Create receipt record
      const { error: receiptError } = await supabase
        .from('expense_receipts')
        .insert({
          id: uuidv4(),
          expense_id: expenseId,
          storage_path: receiptPath,
          file_size: receipt.size,
          mime_type: receipt.mimetype,
          uploaded_at: now,
        });

      if (receiptError) {
  
        throw new Error(`Receipt DB Error: ${receiptError.message}`);
      }
    }
    // 3. Budget alert check
    const budgetAlertTriggered = await checkBudgetThreshold(expense.user_id, expense.amount);

    // 4. Return created expense ID (or full data if you want)
    return { id: expenseId, budgetAlertTriggered };


  } catch (err) {
    console.error('Failed creating expense:', err);
    throw err;
  }
};

export const getUserExpenses = async (userId: string) => {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      amount,
      category,
      description,
      expense_date,
      receipt:expense_receipts (
        storage_path,
        file_size
      )
    `)
    .eq('user_id', userId)
    .order('expense_date', { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(expense => ({
    ...expense,
    receipt: expense.receipt.length > 0 ? expense.receipt[0] : null,
  })) as Array<Expense & { receipt: ExpenseReceipt | null }>;
};

const checkBudgetThreshold = async (userId: string, newExpenseAmount: number) => {
  try {
    const { data: budget, error: budgetError } = await supabase
      .from('user_budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (budgetError) {
      console.error('Error fetching user budget:', budgetError);
      return false; // Silent fail
    }

    if (!budget) return false;

    const { data: monthlySpending, error: spendingError } = await supabase
      .rpc('get_monthly_spending', { user_id: userId });

    if (spendingError) {
      console.error('Error fetching monthly spending:', spendingError);
      return false;
    }

    const totalSpending = (monthlySpending || 0) + newExpenseAmount;

    if (totalSpending > budget.monthly_limit * budget.alert_threshold) {
      const { error: functionError } = await supabase.functions.invoke('send-budget-alert', {
        body: { userId },
      });

      if (functionError) {
        console.error('Error invoking send-budget-alert:', functionError);
      }
      return true; // Alert was triggered
    }

    return false; // No alert needed
  } catch (err) {
    console.error('Unexpected error in budget threshold check:', err);
    return false;
  }
};


// Monthly Spending Data
export const getMonthlyExpenses = async (userId: string) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
  const endOfYear = new Date(now.getFullYear(), 11, 31).toISOString();

  const { data, error } = await supabase
    .from('expenses')
    .select('amount, expense_date')
    .eq('user_id', userId)
    .gte('expense_date', startOfYear)
    .lte('expense_date', endOfYear);

  if (error) throw new Error(error.message);

  // Group expenses by month
  const monthlyTotals: { [month: string]: number } = {};

  data?.forEach(expense => {
    const month = new Date(expense.expense_date).toLocaleString('default', { month: 'short' });
    if (!monthlyTotals[month]) monthlyTotals[month] = 0;
    monthlyTotals[month] += expense.amount;
  });

  const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthlyData = allMonths.map(month => ({
    name: month,
    spent: monthlyTotals[month] || 0,
  }));

  // Also get this month's total and last month's total
  const thisMonth = now.getMonth();
  const lastMonth = (thisMonth - 1 + 12) % 12;

  const thisMonthName = allMonths[thisMonth];
  const lastMonthName = allMonths[lastMonth];

  const thisMonthTotal = monthlyTotals[thisMonthName] || 0;
  const lastMonthTotal = monthlyTotals[lastMonthName] || 0;

  let percentChange = 0;
  if (lastMonthTotal > 0) {
    percentChange = (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100);
    percentChange = Math.round(percentChange);
  }

  return {
    monthly: monthlyData,
    thisMonthTotal,
    lastMonthTotal,
    percentChange,
  };
};

// Category Breakdown
export const getCategoryBreakdown = async (userId: string) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  const { data, error } = await supabase
    .from('expenses')
    .select('amount, category')
    .eq('user_id', userId)
    .gte('expense_date', startOfMonth)
    .lte('expense_date', endOfMonth);

  if (error) throw new Error(error.message);

  const categoryTotals: { [category: string]: number } = {};

  let total = 0;

  data?.forEach(expense => {
    if (!categoryTotals[expense.category]) categoryTotals[expense.category] = 0;
    categoryTotals[expense.category] += expense.amount;
    total += expense.amount;
  });

  const categoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    amount,
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
  }));

  return categoryData;
};

// Add this to your expenseController exports
export const getExpenseById = async (userId: string, expenseId: string) => {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      id,
      amount,
      category,
      description,
      expense_date,
      created_at,
      receipt:expense_receipts (
        id,
        storage_path,
        file_size,
        mime_type
      )
    `)
    .eq('id', expenseId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  if (!data) throw new Error('Expense not found');

  return {
    ...data,
    receipt: data.receipt ? data.receipt[0] : null
  };
};