import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import authRoutes from './routes/auth';
import expenseRoutes from './routes/expense';
import { protectRoute } from './middleware/auth';
import budgetRoute  from './routes/budget';
import receiptRoute from './routes/receipt';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:8080',  // frontend origin
  credentials: true,                
}));

//ROUTES
app.use('/auth', authRoutes);
app.use('/api/expenses', protectRoute, expenseRoutes);
app.use('/api/budget', budgetRoute);
app.use('/api/scan', receiptRoute);

// Test route
app.get('/', (req, res) => {
  res.send('Expense Tracker API 🚀');
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});