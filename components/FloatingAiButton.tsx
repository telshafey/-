
import React from 'react';
// FIX: Replaced the 'react-router-dom' namespace import with named imports to resolve component and hook resolution errors, and updated the code to use them directly.
import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const FloatingAiButton: React.FC = () => {
  const location = useLocation();

  if (location.pathname === '/ai-guide') {
    return null;
  }

  return (
    <Link
      to="/ai-guide"
      className="fixed bottom-6 left-6 z-50 group flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-full text-white shadow-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-110 animate-glow"
      aria-label="المرشد الإبداعي"
    >
      <Sparkles size={32} className="transition-transform group-hover:rotate-12" />
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        المرشد الإبداعي
      </span>
    </Link>
  );
};

export default FloatingAiButton;
