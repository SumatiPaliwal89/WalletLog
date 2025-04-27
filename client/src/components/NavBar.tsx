
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, Wallet, Plus, Settings } from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, isActive, onClick }: NavItemProps) => (
  <button 
    onClick={onClick}
    className={`relative flex flex-col items-center p-2 ${isActive ? 'active-nav-item' : ''}`}
  >
    <div className="text-white/80 group-hover:text-white transition-colors">
      {icon}
    </div>
    <span className={`text-xs mt-1 ${isActive ? 'text-neon-blue' : 'text-white/70'}`}>
      {label}
    </span>
    <div className="nav-indicator" />
  </button>
);

const NavBar = ({ activePage, setActivePage }: { activePage: string; setActivePage: (page: string) => void }) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 cyber-card p-2 w-[85%] max-w-md z-50">
      <div className="flex justify-around items-center">
        <NavItem 
          icon={<Home size={22} />} 
          label="Dashboard" 
          isActive={activePage === 'dashboard'} 
          onClick={() => setActivePage('dashboard')} 
        />
        <NavItem 
          icon={<div className="relative">
            <div className="absolute inset-0 bg-electric-pink rounded-full animate-pulse-ring opacity-75"></div>
            <div className="relative bg-electric-pink p-2 rounded-full">
              <Plus size={22} className="text-white" />
            </div>
          </div>} 
          label="Add" 
          isActive={activePage === 'add'} 
          onClick={() => setActivePage('add')} 
        />
         <NavItem 
          icon={<Wallet size={22} />} 
          label="Expenses" 
          isActive={activePage === 'expenses'} 
          onClick={() => setActivePage('expenses')} 
        />
        <NavItem 
          icon={<Calendar size={22} />} 
          label="Reports" 
          isActive={activePage === 'reports'} 
          onClick={() => setActivePage('reports')} 
        />
        
      </div>
    </div>
  );
};

export default NavBar;
