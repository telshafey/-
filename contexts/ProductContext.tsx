import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext.tsx';
import { supabase } from '../lib/supabaseClient.ts';
// FIX: Added .ts extension to database.types import to resolve module error.
import { Json } from '../lib/database.types.ts';
import { EGYPTIAN_GOVERNORATES } from '../utils/governorates.ts';

export interface Prices {
    story: {
        printed: number;
        electronic: number;
    };
    coloringBook: number;
    duaBooklet: number;
    valuesStory: number;
    skillsStory: number;
    giftBox: number;
    subscriptionBox: number;
}

export interface SiteBranding {
    logoUrl: string | null;
    creativeWritingLogoUrl: string | null;
    heroImageUrl: string | null;
    aboutImageUrl: string | null;
    creativeWritingPortalImageUrl: string | null;
}

export interface ShippingCosts {
    [governorate: string]: number;
}

interface ProductContextType {
    prices: Prices | null;
    setPrices: (newPrices: Prices) => Promise<void>;
    shippingCosts: ShippingCosts | null;
    setShippingCosts: (newCosts: ShippingCosts) => Promise<void>;
    siteBranding: SiteBranding | null;
    setSiteBranding: (brandingChanges: Partial<SiteBranding>) => Promise<void>;
    loading: boolean;
    error: string | null;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [prices, setPricesState] = useState<Prices | null>(null);
    const [siteBranding, setSiteBrandingState] = useState<SiteBranding | null>(null);
    const [shippingCosts, setShippingCostsState] = useState<ShippingCosts | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('site_settings')
                .select('*')
                .eq('id', 1)
                .single();

            if (fetchError) throw fetchError;
            
            if (data) {
                // FIX: Cast to 'unknown' first to handle Supabase's broad 'Json' type safely.
                setPricesState(data.prices as unknown as Prices);
                // FIX: Cast to 'unknown' first to handle Supabase's broad 'Json' type safely.
                setSiteBrandingState(data.site_branding as unknown as SiteBranding);
                setShippingCostsState(data.shipping_costs as ShippingCosts);
            } else {
                 throw new Error("لم يتم العثور على إعدادات الموقع. يرجى التأكد من تهيئة قاعدة البيانات.");
            }
        } catch (e: any) {
            console.error("Fetch product data error:", e.message || e);
            setError(`فشل الاتصال بقاعدة البيانات: ${e.message}`);
            addToast(`فشل الاتصال بقاعدة البيانات. تأكد من صحة بيانات الاتصال.`, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const setPrices = async (newPrices: Prices) => {
        const { error: updateError } = await supabase
            .from('site_settings')
            .update({ prices: newPrices as unknown as Json })
            .eq('id', 1);
        
        if (updateError) { addToast('فشل تحديث الأسعار.', 'error'); throw updateError; }
        setPricesState(newPrices);
        addToast('تم تحديث الأسعار بنجاح.', 'success');
    };

    const setShippingCosts = async (newCosts: ShippingCosts) => {
        const { error: updateError } = await supabase
            .from('site_settings')
            .update({ shipping_costs: newCosts as Json })
            .eq('id', 1);
            
        if (updateError) { addToast('فشل تحديث تكاليف الشحن.', 'error'); throw updateError; }
        setShippingCostsState(newCosts);
        addToast('تم تحديث تكاليف الشحن بنجاح.', 'success');
    };

    const setSiteBranding = async (brandingChanges: Partial<SiteBranding>) => {
        const { data: currentSettings, error: fetchError } = await supabase
            .from('site_settings')
            .select('site_branding')
            .eq('id', 1)
            .single();

        if (fetchError) { addToast('فشل جلب بيانات العلامة التجارية الحالية.', 'error'); throw fetchError; }
        
        if (!currentSettings) { addToast('فشل جلب الإعدادات الحالية.', 'error'); throw new Error("Could not fetch current settings."); }

        // FIX: Cast to 'unknown' first to handle Supabase's broad 'Json' type safely.
        const currentBranding = (currentSettings.site_branding || {}) as unknown as SiteBranding;
        const newBranding = { ...currentBranding, ...brandingChanges };
        
        const { error: updateError } = await supabase
            .from('site_settings')
            .update({ site_branding: newBranding as Json })
            .eq('id', 1);
        
        if (updateError) { addToast('فشل تحديث العلامة التجارية للموقع.', 'error'); throw updateError; }
        setSiteBrandingState(newBranding);
        addToast('تم تحديث العلامة التجارية للموقع.', 'success');
    };
    
    const value = {
        prices,
        setPrices,
        shippingCosts,
        setShippingCosts,
        siteBranding,
        setSiteBranding,
        loading,
        error
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProduct = (): ProductContextType => {
    const context = useContext(ProductContext);
    if (context === undefined) {
        throw new Error('useProduct must be used within a ProductProvider');
    }
    return context;
};
