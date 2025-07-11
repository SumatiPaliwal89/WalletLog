// src/routes/expenses.ts
import express, { Request, Response } from 'express';
import multer from 'multer';
import { protectRoute } from '../middleware/auth';
import { createExpense, getUserExpenses , getMonthlyExpenses, getCategoryBreakdown, getMonthExpenses, getExpenseById} from '../controllers/expenseController';
import { Expense } from '../types/tables';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max receipt size
});

const router = express.Router();

// POST /expenses
router.post(
  '/',
  protectRoute,
  upload.single('receipt'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { amount, category, description, expense_date } = req.body;

      // Basic validation
      if (!amount || isNaN(parseFloat(amount))) {
        res.status(400).json({ error: 'Amount must be a valid number' });
        return;
      }
      if (!category) {
        res.status(400).json({ error: 'Category is required' });
        return;
      }

      let parsedDate: Date;
      if (expense_date) {
        const tmp = new Date(expense_date);
        if (isNaN(tmp.getTime())) {
          res.status(400).json({ error: 'Invalid expense date' });
          return;
        }
        parsedDate = tmp;
      } else {
        parsedDate = new Date();
      }

      const expense: Omit<Expense, 'id'> = {
        user_id: req.user.id,
        amount: parseFloat(amount),
        category: category as Expense['category'],
        description: description || undefined,
        expense_date: parsedDate,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await createExpense({ expense, receipt: req.file });
      res.status(201).json({ success: true, data: result });

    } catch (error: any) {
      console.error('Error creating expense:', error);
      res.status(500).json({ success: false, error: error.message || 'Internal server error' });
    }
  }
);


// GET /api/expenses - Get all expenses for current user
router.get('/', protectRoute, async (req, res) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const expenses = await getUserExpenses(req.user.id);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
  }
});

// GET /api/expenses/categories
router.get('/categories', protectRoute, async (req, res) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    console.log('Fetching category breakdown for user:', req.user.id);
    const breakdown = await getCategoryBreakdown(req.user.id);
    res.json({ categories: breakdown });
  } catch (error) {
    console.error('Error in category breakdown:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

router.get('/month', protectRoute, async (req, res) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const report = await getMonthExpenses(req.user.id);
    res.json(report);
  } catch (error) {
    console.error('Error in monthly report:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});
// GET /api/expenses/monthly
router.get('/monthly', protectRoute, async (req, res) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const report = await getMonthlyExpenses(req.user.id);
    res.json(report);
  } catch (error) {
    console.error('Error in monthly report:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});
router.get('/:id', protectRoute, async (req, res) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    console.log('Fetching expense with ID:', req.params.id);

    const { id } = req.params;
    const expense = await getExpenseById(req.user.id, id);
    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    res.json(expense);
  }
  catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
}
);



export default router;
