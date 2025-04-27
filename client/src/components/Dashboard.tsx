import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Mic, Camera } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Dashboard = ({ setActivePage }: { setActivePage: (page: string) => void }) => {

  const [expenseData, setExpenseData] = useState([]);
  const [totalBudget, setTotalBudget] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [addMethod, setAddMethod] = useState<'form' | 'voice' | 'receipt' | null>(null);

  const categories = [
    { id: 'food', name: 'Food', icon: '🍔', color: '#00F0FF' },
    { id: 'transport', name: 'Transport', icon: '🚌', color: '#9B6DFF' },
    { id: 'education', name: 'Education', icon: '📚', color: '#FF2E93' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#34D399' },
    { id: 'rent', name: 'Rent', icon: '🏠', color: '#FBBF24' },
    { id: 'others', name: 'Others', icon: '⚡', color: '#FB7185' },
  ];

  const getCategoryColor = (category: string) => {
    const found = categories.find(
      c => c.name.toLowerCase() === category.toLowerCase() || c.id === category.toLowerCase()
    );
    return found ? found.color : '#E5E7EB';
  };

  const getCategoryIcon = (category: string) => {
    const found = categories.find(
      c => c.name.toLowerCase() === category.toLowerCase() || c.id === category.toLowerCase()
    );
    return found ? found.icon : '💸';
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        const [expensesResponse, budgetResponse] = await Promise.all([
          axios.get('http://localhost:3000/api/expenses', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:3000/api/budget', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const expenses = expensesResponse.data;
        const budget = budgetResponse.data.monthly_limit;

        const categoryTotals = expenses.reduce((acc: any, expense: any) => {
          if (!acc[expense.category]) {
            acc[expense.category] = 0;
          }
          acc[expense.category] += expense.amount;
          return acc;
        }, {});

        const pieChartData = Object.keys(categoryTotals).map(category => ({
          name: category,
          value: categoryTotals[category],
          color: getCategoryColor(category),
        }));

        setExpenseData(pieChartData);
        setTotalBudget(budget);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const totalSpent = expenseData.reduce((sum: number, item: any) => sum + item.value, 0);
  const remaining = totalBudget - totalSpent;
  const percentSpent = (totalSpent / totalBudget) * 100;

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="pb-24 animate-slide-up px-4">
      {/* Budget Card */}
      <div className="cyber-card p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 neon-text">April Budget</h2>
        <div className="relative h-40 w-40 mx-auto">
          <div className="absolute inset-0 rounded-full border-8 border-muted/30"></div>
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeDasharray={`${percentSpent * 2.83} 283`}
              className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
            />
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#9B6DFF" />
            </linearGradient>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-white">₹{formatCurrency(remaining)}</span>
            <span className="text-xs text-white/70">remaining</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-sm text-white/70">
            <span className="text-neon-blue font-bold">₹{formatCurrency(totalSpent)}</span> spent of <span className="text-white font-bold">₹{formatCurrency(totalBudget)}</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="cyber-card p-2 bg-black/40 animate-float">
              <div className="text-xs text-white/70">Daily</div>
              <div className="text-sm font-bold text-white">₹{formatCurrency(Math.round(remaining / 30))}</div>
            </div>
            <div className="cyber-card p-2 bg-black/40 animate-float">
              <div className="text-xs text-white/70">Weekly</div>
              <div className="text-sm font-bold text-white">₹{formatCurrency(Math.round(remaining / 4))}</div>
            </div>
            <div className="cyber-card p-2 bg-black/40 animate-float">
              <div className="text-xs text-white/70">Savings</div>
              <div className="text-sm font-bold text-green-400">₹{formatCurrency(Math.round(totalBudget * 0.1))}</div>
            </div>
          </div>

          {remaining < 0 && (
            <div className="mt-4 text-sm font-semibold text-red-500">
              Warning: You have overspent your budget!
            </div>
          )}
        </div>
        
      </div>

      <div className="cyber-card p-6 mb-6">
  <h2 className="text-xl font-bold mb-4 neon-pink-text">Spending Categories</h2>

  {/* Pie Chart - Bigger */}
  <div className="w-full max-w-sm mx-auto mb-6">
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <Pie
          data={expenseData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
          filter="url(#glow)"
        >
          {expenseData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </div>

  <div className="grid grid-cols-1 gap-2 mt-4">
      {expenseData.map((category, index) => (
        <div key={index} className="flex items-center">
          <span className="mr-2 text-lg">{getCategoryIcon(category.name)}</span>
          <span className="text-xs text-white/80">{category.name}</span>
          <span className="text-xs ml-auto font-medium">₹{formatCurrency(category.value)}</span>
        </div>
    ))}
  </div>
</div>



      {/* Add Expense Buttons */}
      <div className="grid grid-cols-1 gap-4 mb-6">
      <button
  onClick={() => setActivePage('add')}
  className={`flex items-center justify-start p-4 cyber-card ${addMethod === 'form' ? 'border-neon-blue' : 'border-white/20'}`}
>
  <Calendar size={22} className="mr-3" />
  <span className="font-semibold text-white text-md">Add Expense by Form</span>
</button>



        <button
          onClick={() => setActivePage('voice')}
          className={`flex items-center justify-start p-4 cyber-card ${addMethod === 'voice' ? 'border-neon-blue' : 'border-white/20'}`}
        >
          <Mic size={22} className="mr-3" />
          <span className="font-semibold text-white text-md">Add Expense by Voice</span>
        </button>

        <button
          onClick={() => setActivePage('receipt')}
          className={`flex items-center justify-start p-4 cyber-card ${addMethod === 'receipt' ? 'border-neon-blue' : 'border-white/20'}`}
        >
          <Camera size={22} className="mr-3" />
          <span className="font-semibold text-white text-md">Add Expense by Receipt</span>
        </button>
      </div>

      {addMethod && (
        <div className="mt-6 p-4 cyber-card text-white text-center mb-6">
          Selected Method: <span className="text-neon-blue font-bold capitalize">{addMethod}</span>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
