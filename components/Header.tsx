
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-sky-600">
          Marina's Package Tracker
        </div>
        <div className="text-slate-600">
          ניהול קל וחכם למשלוחים שלך
        </div>
      </div>
    </header>
  );
};

export default Header;
