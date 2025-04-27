
import React from 'react';
import { useState } from 'react';
import AuthForm from '../components/auth/AuthForm';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyber-dark to-cyber-deep p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold font-space neon-text mb-2">WalletWiz</h1>
          <p className="text-white/60">Track Smart, Spend Wise</p>
        </div>
        
        <AuthForm 
          isLogin={isLogin} 
          onToggleMode={() => setIsLogin(!isLogin)} 
        />
      </div>
    </div>
  );
};

export default Auth;
