import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

// Define types
export interface Prices {
    story: { printed: number, electronic: number };
    coloringBook: number;
    duaBooklet: number;
    giftBox: number;
    // FIX: Added missing price properties to align with AdminProductsPage.tsx.
    valuesStory: number;
    skillsStory: number;
}

export interface SiteBranding {
    logoUrl: string | null;
    heroImageUrl: string | null;
    aboutImageUrl: string | null;
    creativeWritingLogoUrl: string | null;
}

interface ProductContextType {
  prices: Prices | null;
  setPrices: (newPrices: Prices) => Promise<void>;
  siteBranding: SiteBranding | null;
  setSiteBranding: (newBranding: Partial<SiteBranding>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// --- Mock Data ---
const MOCK_PRICES: Prices = {
    story: { printed: 700, electronic: 450 },
    coloringBook: 150,
    duaBooklet: 250,
    giftBox: 1200,
    // FIX: Added mock values for the new price properties.
    valuesStory: 350,
    skillsStory: 350,
};

const MOCK_SITE_BRANDING: SiteBranding = {
    logoUrl: 'https://i.ibb.co/7JdC01C/Enha-Lak-Logo.png',
    heroImageUrl: 'https://i.ibb.co/RzJzQhL/hero-image-new.jpg',
    aboutImageUrl: 'https://i.ibb.co/8XYt2s5/about-us-image.jpg',
    creativeWritingLogoUrl: 'https://i.ibb.co/bF9gYq2/Bidayat-Alrehla-Logo.png',
};


// Create Context
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Create Provider
export const ProductProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [prices, setPricesState] = useState<Prices | null>(null);
  const [siteBranding, setSiteBrandingState] = useState<SiteBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Simulate async fetch
    await new Promise(res => setTimeout(res, 200)); 
    setPricesState(MOCK_PRICES);
    setSiteBrandingState(MOCK_SITE_BRANDING);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updatePrices = async (newPrices: Prices) => {
    setPricesState(newPrices); 
    console.log("Mock update prices:", newPrices);
    addToast('تم تحديث الأسعار بنجاح (تجريبيًا)!', 'success');
  };

  const updateSiteBranding = async (newBranding: Partial<SiteBranding>) => {
    setSiteBrandingState(prev => prev ? { ...prev, ...newBranding } : null);
    console.log("Mock update branding:", newBranding);
    // Toast is handled in the settings page for a unified message.
  };


  return (
    <ProductContext.Provider value={{ 
        prices, setPrices: updatePrices, 
        siteBranding, setSiteBranding: updateSiteBranding,
        loading, error
    }}>
      {children}
    </ProductContext.Provider>
  );
};

// Create Hook
export const useProduct = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};