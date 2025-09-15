import React, { useState, useEffect } from 'react';
import { Save, Loader2, Truck } from 'lucide-react';
import { useProduct, ShippingCosts } from '../../contexts/ProductContext';
import { useToast } from '../../contexts/ToastContext';
import { EGYPTIAN_GOVERNORATES } from '../../utils/governorates.ts';
import AdminSection from '../../components/admin/AdminSection';

const ShippingCostInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    disabled: boolean;
}> = ({ label, value, onChange, disabled }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
        <div className="relative">
            <input 
                type="number" 
                value={value} 
                onChange={(e) => onChange(Number(e.target.value))} 
                className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                disabled={disabled}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">ج.م</span>
        </div>
    </div>
);

const AdminShippingPage: React.FC = () => {
    const { shippingCosts, setShippingCosts, loading: isContextLoading } = useProduct();
    const [editableCosts, setEditableCosts] = useState<ShippingCosts>({});
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (shippingCosts) {
            setEditableCosts(JSON.parse(JSON.stringify(shippingCosts)));
        } else {
            // Initialize with default values if not available
            const initialCosts: ShippingCosts = {};
            EGYPTIAN_GOVERNORATES.forEach(gov => {
                initialCosts[gov] = 0;
            });
            setEditableCosts(initialCosts);
        }
    }, [shippingCosts]);

    const handleChange = (governorate: string, value: number) => {
        setEditableCosts(prev => ({
            ...prev,
            [governorate]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await setShippingCosts(editableCosts);
        } catch (error: any) {
             addToast(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isContextLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>
    }

    return (
        <div className="animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8">إدارة الشحن</h1>
            <form onSubmit={handleSubmit}>
                <AdminSection title="تكاليف الشحن للمحافظات" icon={<Truck />}>
                     <p className="text-gray-600 mb-6 -mt-4">
                        حدد تكلفة الشحن لكل محافظة. تكلفة الشحن للقاهرة يجب أن تكون 0.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {EGYPTIAN_GOVERNORATES.map(gov => (
                            <ShippingCostInput
                                key={gov}
                                label={gov}
                                value={editableCosts[gov] || 0}
                                onChange={(value) => handleChange(gov, value)}
                                disabled={isSaving || gov === 'القاهرة'}
                            />
                        ))}
                    </div>
                </AdminSection>

                <div className="flex justify-end sticky bottom-6 mt-8">
                    <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التكاليف'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminShippingPage;
