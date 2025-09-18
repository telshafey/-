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

// --- Default values to prevent app from getting stuck ---
const defaultPrices: Prices = {
    story: { printed: 0, electronic: 0 },
    coloringBook: 0,
    duaBooklet: 0,
    valuesStory: 0,
    skillsStory: 0,
    giftBox: 0,
    subscriptionBox: 0,
};

const defaultBranding: SiteBranding = {
    logoUrl: null,
    creativeWritingLogoUrl: null,
    heroImageUrl: null,
    aboutImageUrl: null,
    creativeWritingPortalImageUrl: null,
};

const defaultShippingCosts: ShippingCosts = {};
EGYPTIAN_GOVERNORATES.forEach(gov => {
    defaultShippingCosts[gov] = gov === "القاهرة" ? 0 : 60; // Default for Cairo is 0, others 60
});

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
                const fetchedPrices = data.prices as unknown as Prices;
                const fetchedBranding = data.site_branding as unknown as SiteBranding;
                const fetchedShipping = data.shipping_costs as ShippingCosts;

                setPricesState(fetchedPrices || defaultPrices);
                setSiteBrandingState(fetchedBranding || defaultBranding);
                setShippingCostsState(fetchedShipping || defaultShippingCosts);

                if (!fetchedPrices || !fetchedBranding || !fetchedShipping) {
                    addToast("بعض إعدادات الموقع الأساسية مفقودة. يرجى مراجعة لوحة التحكم.", 'warning');
                }
            } else {
                 const initError = new Error("لم يتم العثور على إعدادات الموقع. يرجى التأكد من تهيئة قاعدة البيانات.");
                 setError(initError.message);
                 addToast(initError.message, 'error');
                 setPricesState(defaultPrices);
                 setSiteBrandingState(defaultBranding);
                 setShippingCostsState(defaultShippingCosts);
            }
        } catch (e: any) {
            console.error("Fetch product data error:", e.message || e);
            const fetchErrorMsg = `فشل الاتصال بقاعدة البيانات: ${e.message}`;
            setError(fetchErrorMsg);
            addToast(`فشل الاتصال بقاعدة البيانات. تأكد من صحة بيانات الاتصال.`, 'error');
            setPricesState(defaultPrices);
            setSiteBrandingState(defaultBranding);
            setShippingCostsState(defaultShippingCosts);
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
    
    // Radical Fix: Use a dependency-free, inline-styled loading and error gate
    // to prevent crashes from external dependencies (like lucide-react) during initial load.
    if (loading || !prices || !siteBranding || !shippingCosts) {
        if (error) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    height: '100vh', backgroundColor: '#fef2f2', color: '#b91c1c',
                    fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center'
                }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>خطأ في تحميل البيانات الأساسية</h1>
                    <p>{error}</p>
                    <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>يرجى التحقق من إعدادات الاتصال بـ Supabase وتحديث الصفحة.</p>
                </div>
            );
        }
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', fontFamily: 'sans-serif', fontSize: '1.25rem', color: '#4b5563'
            }}>
                <p>...جاري تهيئة المنصة</p>
            </div>
        );
    }

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
