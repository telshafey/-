
import React from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const FloatingAiButton: React.FC = () => {
  const location = ReactRouterDOM.useLocation();

  if (location.pathname === '/ai-guide') {
    return null;
  }

  return (
    <ReactRouterDOM.Link
      to="/ai-guide"
      className="fixed bottom-6 left-6 z-50 group flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full text-white shadow-lg hover:bg-purple-700 transition-all duration-300 transform hover:scale-110 animate-pulse-slow"
      aria-label="المرشد الإبداعي"
    >
      <Sparkles size={32} className="transition-transform group-hover:rotate-12" />
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        المرشد الإبداعي
      </span>
    </ReactRouterDOM.Link>
  );
};

export default FloatingAiButton;