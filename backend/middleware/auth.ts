import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY! 
);

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      supabase?: typeof supabase;
    }
  }
}

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Missing authorization token' });
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = { id: data.user.id };
    req.supabase = supabase; // attach client if needed in controller
    next(); // ✅ continue request
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Server error in authentication' });
  }
};
