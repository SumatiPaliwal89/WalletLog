'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import axios from 'axios';

const Expenses = () => {
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/expenses', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const expenses = response.data;

        const categories = [
          { id: 'food', name: 'Food', icon: '🍔' },
          { id: 'transport', name: 'Transport', icon: '🚌' },
          { id: 'education', name: 'Education', icon: '📚' },
          { id: 'entertainment', name: 'Entertainment', icon: '🎮' },
          { id: 'rent', name: 'Rent', icon: '🏠' },
          { id: 'others', name: 'Others', icon: '⚡' },
        ];

        const getCategoryIcon = (category: string) => {
          const found = categories.find(
            c => c.name.toLowerCase() === category.toLowerCase() || c.id === category.toLowerCase()
          );
          return found ? found.icon : '💸';
        };

        const transactionsData = expenses.map((expense: any, idx: number) => ({
          id: idx,
          title: expense.description || expense.category,
          amount: -expense.amount,
          date: new Date(expense.expense_date).toLocaleDateString(),
          category: expense.category,
          icon: getCategoryIcon(expense.category),
        }));

        setRecentTransactions(transactionsData);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 animate-slide-up">
      <div className="cyber-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold neon-text">All Transactions</h2>
          <button
            className="text-xs text-neon-blue flex items-center"
            onClick={() => setShowAllTransactions(prev => !prev)}
          >
            {showAllTransactions ? 'Show Less' : 'Show More'} <ArrowDown className="ml-1 h-3 w-3" />
          </button>
        </div>

        <div className="space-y-4">
          {(showAllTransactions ? recentTransactions : recentTransactions.slice(0, 10)).map((transaction) => (
            <div key={transaction.id} className="flex items-center py-4 border-b border-white/10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                transaction.amount > 0 ? 'bg-cyber-green/20' : 'bg-electric-pink/20'
              }`}>
                {transaction.icon}
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-white">{transaction.title}</h3>
                <p className="text-xs text-white/60">{transaction.date} • {transaction.category}</p>
              </div>
              <div className={`text-sm font-bold ${
                transaction.amount > 0 ? 'text-cyber-green' : 'text-electric-pink'
              }`}>
                {transaction.amount > 0 ? '+' : ''}₹{formatCurrency(Math.abs(transaction.amount))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
