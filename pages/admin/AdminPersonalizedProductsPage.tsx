import React, { useState, useEffect } from 'react';
import { Gift, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { PersonalizedProduct } from '../../lib/database.types';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';


const AdminPersonalizedProductsPage: React.FC = () => {
    const { personalizedProducts, loading, error, updatePersonalizedProduct } = useAdmin();
    
    const [editableProducts, setEditableProducts] = useState<PersonalizedProduct[]>([]);
    const [imageFiles, setImageFiles] = useState<{ [id: number]: File | null }>({});
    const [imagePreviews, setImagePreviews] = useState<{ [id: number]: string | null }>({});
    const [savingStatus, setSavingStatus] = useState<{ [id: number]: boolean }>({});

    useEffect(() => {
        // Deep copy to prevent direct state mutation on input change
        setEditableProducts(JSON.parse(JSON.stringify(personalizedProducts)));
    }, [personalizedProducts]);

    const handleTextChange = (id: number, field: 'title' | 'description', value: string) => {
        setEditableProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleFeaturesChange = (id: number, value: string) => {
        setEditableProducts(prev => prev.map(p => {
            if (p.id === id) {
                // Split by newline and filter empty lines for features
                return { ...p, features: value.split('\n').filter(f => f.trim() !== '') };
            }
            return p;
        }));
    };
    
    const handleFileSelect = (id: number, file: File) => {
        setImageFiles(prev => ({ ...prev, [id]: file }));
        setImagePreviews(prev => ({ ...prev, [id]: URL.createObjectURL(file) }));
    };

    const handleCancelImageChange = (id: number) => {
        setImageFiles(prev => ({...prev, [id]: null}));
        setImagePreviews(prev => ({...prev, [id]: null}));
    }

    const handleSave = async (id: number) => {
        const file = imageFiles[id];
        const productToSave = editableProducts.find(p => p.id === id);
        if (!productToSave) return;

        setSavingStatus(prev => ({...prev, [id]: true}));
        try {
            await updatePersonalizedProduct({
                id: productToSave.id,
                title: productToSave.title,
                description: productToSave.description,
                features: productToSave.features,
                imageFile: file || null,
            });
            handleCancelImageChange(id); // Clear preview and file after successful save
        } catch (e) {
            // Toast is shown in context
        } finally {
            setSavingStatus(prev => ({...prev, [id]: false}));
        }
    };

    const isProductDirty = (id: number) => {
        const originalProduct = personalizedProducts.find(p => p.id === id);
        const editedProduct = editableProducts.find(p => p.id === id);
        if (!originalProduct || !editedProduct) return false;

        if (imageFiles[id]) return true; // A new image is a change
        if (editedProduct.title !== originalProduct.title) return true;
        if (editedProduct.description !== originalProduct.description) return true;
        if (JSON.stringify(editedProduct.features || []) !== JSON.stringify(originalProduct.features || [])) return true;
        
        return false;
    };


    if (loading) {
        return <PageLoader text="جاري تحميل بيانات المنتجات..." />;
    }

    if (error) {
        return <div className="text-center text-red-500 text-lg bg-red-50 p-6 rounded-lg">{error}</div>;
    }

    return (
        <div className="animate-fadeIn space-y-12">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة منتجات "إنها لك"</h1>
            
            <AdminSection title="تحرير المنتجات" icon={<Gift />}>
                <div className="space-y-8">
                    {editableProducts.sort((a,b) => (a.sort_order || 99) - (b.sort_order || 99)).map(product => {
                        const isDirty = isProductDirty(product.id);
                        const isSaving = savingStatus[product.id];
                        
                        return (
                            <div key={product.id} className="p-4 bg-gray-50 rounded-lg border relative">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Image Section */}
                                    <div className="flex flex-col items-center">
                                        <img 
                                            src={imagePreviews[product.id] || product.image_url || undefined} 
                                            alt={product.title} 
                                            className="w-40 h-40 object-contain rounded-md bg-white shadow-sm mb-3" 
                                        />
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                id={`file-${product.id}`}
                                                onChange={(e) => e.target.files && handleFileSelect(product.id, e.target.files[0])}
                                                accept="image/png, image/jpeg, image/webp"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <label htmlFor={`file-${product.id}`} className="flex items-center gap-2 bg-white border border-gray-300 text-sm font-semibold py-2 px-4 rounded-full hover:bg-gray-100 cursor-pointer">
                                                <ImageIcon size={16}/>
                                                <span>{imageFiles[product.id] ? "تغيير الصورة" : "رفع صورة جديدة"}</span>
                                            </label>
                                        </div>
                                         {imageFiles[product.id] && (
                                            <button onClick={() => handleCancelImageChange(product.id)} className="mt-2 text-xs text-red-600 hover:underline">إلغاء تغيير الصورة</button>
                                         )}
                                    </div>

                                    {/* Details Section */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <div>
                                            <label htmlFor={`title-${product.id}`} className="block text-sm font-bold text-gray-700 mb-1">اسم المنتج</label>
                                            <input 
                                                type="text" 
                                                id={`title-${product.id}`}
                                                value={product.title}
                                                onChange={(e) => handleTextChange(product.id, 'title', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`description-${product.id}`} className="block text-sm font-bold text-gray-700 mb-1">وصف المنتج</label>
                                            <textarea 
                                                id={`description-${product.id}`}
                                                value={product.description}
                                                onChange={(e) => handleTextChange(product.id, 'description', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                rows={4}
                                            />
                                        </div>
                                         <div>
                                            <label htmlFor={`features-${product.id}`} className="block text-sm font-bold text-gray-700 mb-1">الميزات (كل ميزة في سطر)</label>
                                            <textarea 
                                                id={`features-${product.id}`}
                                                value={(product.features || []).join('\n')}
                                                onChange={(e) => handleFeaturesChange(product.id, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button 
                                        onClick={() => handleSave(product.id)} 
                                        disabled={!isDirty || isSaving}
                                        className="flex items-center gap-2 bg-blue-600 text-white text-sm font-bold py-2 px-6 rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        <span>{isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </AdminSection>
        </div>
    );
};

export default AdminPersonalizedProductsPage;