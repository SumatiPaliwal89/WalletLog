import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Dashboard from '../components/Dashboard';
import AddExpense from '../components/AddExpense';
import Reports from '../components/Reports';
import Expenses from '../components/Expenses';
import Voice from '../components/Voice';
import Receipt from '../components/Receipt'


const Index = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
    }
  }, [navigate]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'add':
        return <AddExpense />;
      case 'expenses':
        return <Expenses />;
      case 'reports':
        return <Reports />;
      case 'voice':
        return <Voice />;
      case 'receipt':
        return <Receipt />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };
  

  return (
    <div className="min-h-screen w-full pb-20">
      <div className="max-w-md mx-auto pt-10 px-4 pb-28">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-space neon-text">WalletLog</h1>
            <p className="text-white/60 text-sm">Track Smart, Spend Wise</p>
          </div>
          <div className="cyber-card p-2 bg-black/40 flex items-center">
            <div className="animate-pulse w-2 h-2 rounded-full bg-cyber-green mr-1"></div>
            <span className="text-xs text-white/70">Student</span>
          </div>
        </header>
        
        {renderPage()}
      </div>
      <NavBar activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

export default Index;
