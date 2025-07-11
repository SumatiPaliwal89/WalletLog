// src/components/Details.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Receipt, FileText, Calendar, Tag, DollarSign, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const Details = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = [
    { id: 'food', name: 'Food', icon: '🍔', color: '#00F0FF' },
    { id: 'transport', name: 'Transport', icon: '🚌', color: '#9B6DFF' },
    { id: 'education', name: 'Education', icon: '📚', color: '#FF2E93' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#34D399' },
    { id: 'rent', name: 'Rent', icon: '🏠', color: '#FBBF24' },
    { id: 'other', name: 'Other', icon: '⚡', color: '#FB7185' },
  ];

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        const response = await axios.get(`http://localhost:3000/api/expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTransaction(response.data);
      } catch (err) {
        console.error('Failed to fetch transaction:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transaction');
        toast.error('Failed to load transaction details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTransaction();
    }
  }, [id, navigate]);

  const getCategoryDetails = (category: string) => {
    return categories.find(c => 
      c.name.toLowerCase() === category.toLowerCase() || 
      c.id === category.toLowerCase()
    ) || { icon: '💸', color: '#E5E7EB' };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleViewReceipt = () => {
    if (transaction?.receipt?.storage_path) {
      window.open(
        `https://your-supabase-url.supabase.co/storage/v1/object/public/receipts/${transaction.receipt.storage_path}`,
        '_blank'
      );
    } else {
      toast.warning('No receipt available');
    }
  };

  if (loading) {
    return (
      <div className="cyber-card p-6 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neon-blue mx-auto"></div>
        <p className="mt-4 text-white/80">Loading transaction details...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="cyber-card p-6">
        <div className="flex items-center gap-3 text-electric-pink">
          <AlertCircle size={24} />
          <h2 className="text-xl font-bold">Error Loading Transaction</h2>
        </div>
        <p className="mt-4 text-white/80">{error || 'Transaction not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-neon-blue/20 text-neon-blue rounded-lg flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Transactions
        </button>
      </div>
    );
  }

  const categoryDetails = getCategoryDetails(transaction.category);
  const isIncome = transaction.amount > 0;

  return (
    <div className="cyber-card p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold neon-text">Transaction Details</h1>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4`}
          style={{ backgroundColor: `${categoryDetails.color}20` }}>
          {categoryDetails.icon}
        </div>
        <h2 className="text-xl font-bold text-center">{transaction.description || transaction.category}</h2>
        <div className={`text-3xl font-bold mt-2 ${isIncome ? 'text-cyber-green' : 'text-electric-pink'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
        </div>
      </div>

      <div className="grid gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Tag size={18} className="text-neon-blue" />
          </div>
          <div>
            <p className="text-xs text-white/60">Category</p>
            <p className="font-medium">{transaction.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Calendar size={18} className="text-neon-blue" />
          </div>
          <div>
            <p className="text-xs text-white/60">Date</p>
            <p className="font-medium">{formatDate(transaction.expense_date)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <DollarSign size={18} className="text-neon-blue" />
          </div>
          <div>
            <p className="text-xs text-white/60">Type</p>
            <p className="font-medium">{isIncome ? 'Income' : 'Expense'}</p>
          </div>
        </div>

        {transaction.description && (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText size={18} className="text-neon-blue" />
            </div>
            <div>
              <p className="text-xs text-white/60">Description</p>
              <p className="font-medium">{transaction.description}</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 pt-6">
        <h3 className="font-medium flex items-center gap-2 mb-4">
          <Receipt size={18} /> Receipt
        </h3>
        
        {transaction.receipt ? (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xs bg-black/30 rounded-lg p-4 border border-white/10 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/60">File Size:</span>
                <span>{(transaction.receipt.file_size / 1024).toFixed(2)} KB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Type:</span>
                <span>{transaction.receipt.mime_type}</span>
              </div>
            </div>
            <button
              onClick={handleViewReceipt}
              className="px-4 py-2 bg-neon-blue/20 text-neon-blue rounded-lg flex items-center gap-2"
            >
              <Receipt size={16} /> View Receipt
            </button>
          </div>
        ) : (
          <div className="text-center py-6 text-white/50">
            No receipt attached to this transaction
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;