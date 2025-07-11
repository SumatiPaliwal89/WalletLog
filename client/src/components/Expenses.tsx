'use client';

import React, { useEffect, useState } from 'react';
import { ArrowDown, Search, Calendar, Filter, X } from 'lucide-react';
import axios from 'axios';

const Expenses = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: 'food', name: 'Food', icon: '🍔' },
    { id: 'transport', name: 'Transport', icon: '🚌' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮' },
    { id: 'rent', name: 'Rent', icon: '🏠' },
    { id: 'others', name: 'Others', icon: '⚡' },
  ];

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/expenses', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const expenses = response.data;

        const transactionsData = expenses.map((expense: any, idx: number) => ({
          id: idx,
          title: expense.description || expense.category,
          amount: -expense.amount,
          date: new Date(expense.expense_date).toLocaleDateString(),
          originalDate: new Date(expense.expense_date),
          category: expense.category,
          icon: getCategoryIcon(expense.category),
          originalAmount: expense.amount,
        }));

        setAllTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategory, dateRange, amountRange, allTransactions]);

  const getCategoryIcon = (category: string) => {
    const found = categories.find(
      c => c.name.toLowerCase() === category.toLowerCase() || c.id === category.toLowerCase()
    );
    return found ? found.icon : '💸';
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const applyFilters = () => {
    let results = [...allTransactions];

    // Keyword search
    if (searchTerm) {
      results = results.filter(transaction =>
        transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      results = results.filter(transaction =>
        transaction.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Date range filter
    if (dateRange.start || dateRange.end) {
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      results = results.filter(transaction => {
        const transactionDate = transaction.originalDate;
        return (
          (!startDate || transactionDate >= startDate) &&
          (!endDate || transactionDate <= endDate)
        );
      });
    }

    // Amount range filter
    if (amountRange.min || amountRange.max) {
      const minAmount = amountRange.min ? parseFloat(amountRange.min) : 0;
      const maxAmount = amountRange.max ? parseFloat(amountRange.max) : Infinity;

      results = results.filter(transaction => {
        const amount = Math.abs(transaction.originalAmount);
        return amount >= minAmount && amount <= maxAmount;
      });
    }

    setFilteredTransactions(results);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setDateRange({ start: '', end: '' });
    setAmountRange({ min: '', max: '' });
    setFilteredTransactions(allTransactions);
  };

  const hasActiveFilters = searchTerm || selectedCategory || dateRange.start || dateRange.end || amountRange.min || amountRange.max;

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 animate-slide-up">
      <div className="cyber-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold neon-text">All Transactions</h2>
          <div className="flex gap-2">
            <button
              className="text-xs text-neon-blue flex items-center"
              onClick={() => setShowAllTransactions(prev => !prev)}
            >
              {showAllTransactions ? 'Show Less' : 'Show More'} <ArrowDown className="ml-1 h-3 w-3" />
            </button>
            <button
              className="text-xs text-neon-blue flex items-center"
              onClick={() => setShowFilters(prev => !prev)}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-neon-blue/50"
          />
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="cyber-card bg-black/30 p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Category Filter */}
  <div>
    <label className="block text-xs text-white/70 mb-1">Category</label>
    <select
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="w-full bg-black/50 text-white p-2 rounded border border-white/20 text-sm"
    >
      <option value="">All Categories</option>
      {categories.map((category) => (
        <option key={category.id} value={category.name}>
          {category.name}
        </option>
      ))}
    </select>
  </div>

  {/* Amount Range Filter */}
  <div>
    <label className="block text-xs text-white/70 mb-1">Amount Range</label>
    <div className="flex gap-2">
      <input
        type="number"
        placeholder="Min"
        value={amountRange.min}
        onChange={(e) => setAmountRange({ ...amountRange, min: e.target.value })}
        className="w-full bg-black/50 text-white p-2 rounded border border-white/20 text-sm"
      />
      <span className="text-white/50">to</span>
      <input
        type="number"
        placeholder="Max"
        value={amountRange.max}
        onChange={(e) => setAmountRange({ ...amountRange, max: e.target.value })}
        className="w-full bg-black/50 text-white p-2 rounded border border-white/20 text-sm"
      />
    </div>
  </div>

  {/* Date Range Filter */}
  <div className="md:col-span-2">
    <label className="block text-xs text-white/70 mb-1">Date Range</label>
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex items-center flex-1">
        <Calendar className="h-4 w-4 mr-2 text-white/50" />
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="w-full bg-black/50 text-white p-2 rounded border border-white/20 text-sm"
        />
      </div>
      <span className="text-white/50 self-center">to</span>
      <div className="flex items-center flex-1">
        <Calendar className="h-4 w-4 mr-2 text-white/50" />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="w-full bg-black/50 text-white p-2 rounded border border-white/20 text-sm"
        />
      </div>
    </div>
  </div>
</div>


            {/* Filter Actions */}
            <div className="flex justify-end mt-4 gap-2">
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-electric-pink flex items-center"
                >
                  <X className="h-4 w-4 mr-1" /> Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="text-xs text-white/50 mb-4">
          Showing {filteredTransactions.length} transactions
          {hasActiveFilters && ' (filtered)'}
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {(showAllTransactions ? filteredTransactions : filteredTransactions.slice(0, 10)).map((transaction) => (
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

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-white/50">
              No transactions found matching your filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;