import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Added .tsx extension to resolve module error.
import App from './App.tsx';
// FIX: Added .tsx extension to resolve module error.
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ProductProvider } from './contexts/ProductContext';
import { ToastProvider } from './contexts/ToastContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <ProductProvider>
          <App />
        </ProductProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);