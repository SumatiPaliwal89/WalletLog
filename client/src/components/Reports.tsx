'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Reports = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [comparisonData, setComparisonData] = useState({ lastMonth: 0, thisMonth: 0, percentChange: 0 });
  const [budget, setBudget] = useState<any>(null);
  const [newBudget, setNewBudget] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [monthlyRes, categoryRes, budgetRes] = await Promise.all([
        axios.get('http://localhost:3000/api/expenses/monthly', config),
        axios.get('http://localhost:3000/api/expenses/categories', config),
        axios.get('http://localhost:3000/api/budget', config),
      ]);

      setMonthlyData(monthlyRes.data.monthly || []);
      setCategoryData(categoryRes.data.categories || []);
      setComparisonData({
        lastMonth: monthlyRes.data.lastMonthTotal || 0,
        thisMonth: monthlyRes.data.thisMonthTotal || 0,
        percentChange: monthlyRes.data.percentChange || 0,
      });
      setBudget(budgetRes.data || null);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetSubmit = async () => {
    try {
      if (!newBudget) return;
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      await axios.post(
        'http://localhost:3000/api/budget',
        { monthly_limit: newBudget },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewBudget('');
      fetchReports();
    } catch (err) {
      console.error('Failed to set budget:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchReports();
    }
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="cyber-card p-2 text-xs">
          <p className="text-white/80">{`${label}`}</p>
          <p className="text-neon-blue font-bold">{`₹${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };
  return (
    <div className="pb-24 px-4 animate-slide-up">
      {/* Budget Section */}
      <div className="cyber-card p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 neon-text">Monthly Budget</h2>
        {budget ? (
          <div className="mb-4 text-white/80">
            Current Budget: <span className="font-bold text-white">₹{budget.monthly_limit}</span>
          </div>
        ) : (
          <div className="mb-4 text-white/60">No budget set yet</div>
        )}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter new budget"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            className="bg-black/30 text-white placeholder:text-white/40"
          />
          <Button onClick={handleBudgetSubmit} className="bg-neon-blue hover:bg-neon-blue/80">
            {budget ? 'Update Budget' : 'Set Budget'}
          </Button>
        </div>
      </div>

      {/* Monthly Analysis */}
      <div className="cyber-card p-6 mb-6">
        <h2 className="text-xl font-bold mb-6 neon-text">April 2025 Analysis</h2>

        <div className="h-[200px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#9B6DFF" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1a2e50" opacity={0.3} vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                axisLine={{ stroke: '#1a2e50' }}
              />
              <YAxis 
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                axisLine={{ stroke: '#1a2e50' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="spent" 
                fill="url(#barGradient)" 
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cyber-card bg-black/40 p-4">
          <div className="flex justify-between items-center">
            <div className="text-white/70 text-xs">Last Month</div>
            <div className="text-white/70 text-xs">This Month</div>
          </div>

          <div className="flex justify-between items-center mt-1">
            <div className="text-white text-lg font-bold">₹{comparisonData.lastMonth}</div>
            <div className={`text-xs ${comparisonData.percentChange > 0 ? 'text-electric-pink' : 'text-cyber-green'}`}>
              {comparisonData.percentChange > 0 ? '+' : ''}{comparisonData.percentChange}%
            </div>
            <div className="text-white text-lg font-bold">₹{comparisonData.thisMonth}</div>
          </div>

          <div className="mt-3 w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-neon-blue to-vibrant-purple" 
              style={{ width: `${(comparisonData.thisMonth / (budget?.monthly_limit || 15000)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="cyber-card p-6 mb-6">
        <h2 className="text-xl font-bold mb-6 neon-pink-text">Category Breakdown</h2>
        <div className="space-y-4">
          {categoryData.map((category: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <div className="text-white text-sm">{category.name}</div>
                <div className="text-white text-sm font-bold">₹{category.amount}</div>
              </div>

              <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full absolute left-0 top-0"
                  style={{ 
                    width: `${category.percentage}%`,
                    background: 
                      index === 0 ? '#00F0FF' : 
                      index === 1 ? '#9B6DFF' : 
                      index === 2 ? '#FF2E93' : 
                      index === 3 ? '#34D399' : 
                      index === 4 ? '#FBBF24' : '#FB7185'
                  }}
                ></div>
              </div>

              <div className="text-white/60 text-xs text-right mt-1">{category.percentage}% of total</div>
            </div>
          ))}
        </div>
      </div>

     
    </div>
  );
};

export default Reports;
