import express from 'express';
import { Request, Response } from 'express';
import { protectRoute } from '../middleware/auth';
import { setMonthlyBudget, getBudgetByUser } from '../controllers/budgetController';

const router = express.Router();


router.post('/', protectRoute, async (req, res) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const validated = {
      user_id: req.user.id,
      monthly_limit: parseFloat(req.body.monthly_limit),
      reset_day: parseInt(req.body.reset_day) || 1,
      alert_threshold: parseFloat(req.body.alert_threshold) || 0.8,
      created_at: new Date(),
      updated_at: new Date()
    };
    const budget = await setMonthlyBudget(validated);
    res.json(budget);
  } catch (error) {
    res.status(400).json({ 
      error: (error as any).message,
      details: (error as any).details || null 
    });
  }
});

// GET /api/budget - Get user's budget
router.get('/', protectRoute, async (req: Request, res: Response, next) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const budget = await getBudgetByUser(req.user.id);
    res.json(budget || { message: "No budget set" });
  } catch (error) {
    next(error);
  }
});

export default router;