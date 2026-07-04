import React from 'react';
import AppRoutes from './AppRoutes';
import GlobalErrorBoundary from './components/shared/GlobalErrorBoundary';
import './global.css';

function App() {
  return (
    <GlobalErrorBoundary>
      <div className="min-h-screen" dir="rtl">
        <AppRoutes />
      </div>
    </GlobalErrorBoundary>
  );
}

export default App;
