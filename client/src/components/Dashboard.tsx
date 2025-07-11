import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Mic, Camera } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Dashboard = ({ setActivePage }: { setActivePage: (page: string) => void }) => {
  const [allExpenses, setAllExpenses] = useState<any[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [thisMonthSpending, setThisMonthSpending] = useState<number>(0);
  const [lastMonthSpending, setLastMonthSpending] = useState<number>(0);
  const [percentChange, setPercentChange] = useState<number>(0);
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('₹', '₹');
  };

  const getCurrentMonthName = () => {
    return new Date().toLocaleString('default', { month: 'long' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [allExpensesRes, budgetRes, monthlyRes] = await Promise.all([
          axios.get('http://localhost:3000/api/expenses', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:3000/api/budget', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:3000/api/expenses/monthly', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setAllExpenses(allExpensesRes.data);
        setMonthlyBudget(budgetRes.data.monthly_limit);
        
        // Set monthly spending data
        setThisMonthSpending(monthlyRes.data.currentMonthTotal);
        setLastMonthSpending(monthlyRes.data.lastMonthTotal);
        setPercentChange(monthlyRes.data.percentChange);

      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate category breakdown from ALL expenses
  const categoryBreakdown = allExpenses.reduce((acc: any, expense: any) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {});

  // Prepare data for pie chart (all expenses)
  const pieChartData = Object.keys(categoryBreakdown).map(category => ({
    name: category,
    value: categoryBreakdown[category],
    color: getCategoryColor(category),
  }));

  // Calculate totals
  const totalSpentAllTime = pieChartData.reduce((sum: number, item: any) => sum + item.value, 0);
  const remainingThisMonth = monthlyBudget - thisMonthSpending;
  const percentSpentThisMonth = (thisMonthSpending / monthlyBudget) * 100;
  const savingsThisMonth = Math.round(monthlyBudget * 0.1);

  // Get current date info for dynamic calculations
  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - currentDay;

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="pb-24 animate-slide-up px-4">
      {/* This Month's Budget Card */}
      <div className="cyber-card p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 neon-text">{getCurrentMonthName()} Budget</h2>
        
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
              strokeDasharray={`${percentSpentThisMonth * 2.83} 283`}
              className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
            />
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="100%" stopColor="#9B6DFF" />
            </linearGradient>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-white">{formatCurrency(remainingThisMonth)}</span>
            <span className="text-xs text-white/70">remaining</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-sm text-white/70">
            <span className="text-neon-blue font-bold">{formatCurrency(thisMonthSpending)}</span> spent of{' '}
            <span className="text-white font-bold">{formatCurrency(monthlyBudget)}</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="cyber-card p-2 bg-black/40 animate-float">
              <div className="text-xs text-white/70">Daily Left</div>
              <div className="text-sm font-bold text-white">
                {formatCurrency(Math.round(remainingThisMonth / Math.max(1, daysRemaining)))}
              </div>
            </div>
            <div className="cyber-card p-2 bg-black/40 animate-float">
              <div className="text-xs text-white/70">Weekly Left</div>
              <div className="text-sm font-bold text-white">
                {formatCurrency(Math.round(remainingThisMonth / Math.max(1, Math.ceil(daysRemaining / 7))))}
              </div>
            </div>
            <div className="cyber-card p-2 bg-black/40 animate-float">
              <div className="text-xs text-white/70">Savings</div>
              <div className="text-sm font-bold text-green-400">
                {formatCurrency(savingsThisMonth)}
              </div>
            </div>
          </div>

          {percentChange !== 0 && (
            <div className={`mt-2 text-sm font-semibold ${percentChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {percentChange > 0 ? '↑' : '↓'} {Math.abs(percentChange)}% from last month
            </div>
          )}

          {remainingThisMonth < 0 && (
            <div className="mt-2 text-sm font-semibold text-red-500">
              Warning: You've exceeded your monthly budget!
            </div>
          )}
        </div>
      </div>

      {/* Spending Categories (All Transactions) */}
      <div className="cyber-card p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 neon-pink-text">All Transactions Breakdown</h2>

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
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                filter="url(#glow)"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 gap-2 mt-4">
          {pieChartData.map((category, index) => (
            <div key={index} className="flex items-center">
              <span className="mr-2 text-lg">{getCategoryIcon(category.name)}</span>
              <span className="text-xs text-white/80">{category.name}</span>
              <span className="text-xs ml-auto font-medium">
                {formatCurrency(category.value)} ({((category.value / totalSpentAllTime) * 100).toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Buttons */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <button
          onClick={() => setActivePage('add')}
          className="flex items-center justify-start p-4 cyber-card border-white/20 hover:border-neon-blue transition-all"
        >
          <Calendar size={22} className="mr-3" />
          <span className="font-semibold text-white text-md">Add Expense by Form</span>
        </button>

        <button
          onClick={() => setActivePage('voice')}
          className="flex items-center justify-start p-4 cyber-card border-white/20 hover:border-neon-blue transition-all"
        >
          <Mic size={22} className="mr-3" />
          <span className="font-semibold text-white text-md">Add Expense by Voice</span>
        </button>

        <button
          onClick={() => setActivePage('receipt')}
          className="flex items-center justify-start p-4 cyber-card border-white/20 hover:border-neon-blue transition-all"
        >
          <Camera size={22} className="mr-3" />
          <span className="font-semibold text-white text-md">Add Expense by Receipt</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;