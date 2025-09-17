import React from 'react';
import { Button } from './button';

interface HeaderProps {
  title: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-20 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center mb-4">
          <img src="/logo.png" alt="Khelsetu Logo" className="h-12 mr-4" />
        </div>
        <Button variant="destructive" onClick={onLogout} className="mb-4 mt-8">
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
