
import React, { useState } from 'react';
import { Calendar, Upload } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const AddExpense = () => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'food', name: 'Food', icon: '🍔', color: '#00F0FF' },
    { id: 'transport', name: 'Transport', icon: '🚌', color: '#9B6DFF' },
    { id: 'education', name: 'Education', icon: '📚', color: '#FF2E93' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#34D399' },
    { id: 'rent', name: 'Rent', icon: '🏠', color: '#FBBF24' },
    { id: 'others', name: 'Others', icon: '⚡', color: '#FB7185' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('expense_date', date);
      
      if (receipt) {
        formData.append('receipt', receipt);
      }

      const token = localStorage.getItem('token');
      console.log(token);
      const response = await axios.post('http://localhost:3000/api/expenses', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Expense added successfully!');
        if (response.data.budgetAlertTriggered) {
          toast.warning('🚨 You are overspending! Please review your budget.');
        }
        // Reset form
        setAmount('');
        setDescription('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setReceipt(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="pb-24 animate-slide-up px-4">
      <div className="cyber-card p-6">
        <h1 className="text-2xl font-bold mb-8 text-center neon-text">Add Expense</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="relative">
            <div className="cyber-card bg-black/40 border-none h-24 flex items-center justify-center mb-8">
              <div className="absolute -top-3 left-4 bg-cyber-deep px-2 py-1 rounded-full text-xs text-white/70">
                Amount
              </div>
              <div className="flex items-center justify-center w-full">
                <span className="text-3xl mr-2 text-white/70">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-4xl font-bold bg-transparent border-none focus:outline-none text-center text-white w-32"
                  required
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 w-24 bg-gradient-to-r from-neon-blue to-vibrant-purple"></div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="block text-sm text-white/70 mb-3">Category</label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`cyber-card p-3 flex flex-col items-center transition-all ${
                    category === cat.id 
                    ? 'border-2 shadow-[0_0_15px_rgba(0,240,255,0.5)] animate-glow' 
                    : 'border border-white/10 hover:border-white/30'
                  }`}
                >
                  <div 
                    className="text-2xl mb-1"
                    style={{
                      textShadow: category === cat.id ? `0 0 10px ${cat.color}` : 'none'
                    }}
                  >
                    {cat.icon}
                  </div>
                  <span className="text-xs text-white/80">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="relative">
            <label className="block text-sm text-white/70 mb-2">Date</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                <Calendar size={18} />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="glass-input pl-10 w-full"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-white/70 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this expense for?"
              className="glass-input w-full h-24 resize-none"
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm text-white/70 mb-2">Receipt</label>
            <label 
              className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center cursor-pointer hover:border-white/40 transition-colors block"
            >
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <Upload className="w-6 h-6 mb-2 text-white/50" />
                <p className="text-white/50 text-sm">
                  {receipt ? receipt.name : 'Click to upload receipt'}
                </p>
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-neon-blue to-vibrant-purple hover:from-vibrant-purple hover:to-neon-blue transition-all duration-300 transform hover:scale-[1.02] focus:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
