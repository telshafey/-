import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ProductProvider } from './contexts/ProductContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// FIX: Corrected method name from 'create_root' to 'createRoot'.
const root = ReactDOM.createRoot(rootElement);
root.render(
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <ProductProvider>
            <App />
          </ProductProvider>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
);