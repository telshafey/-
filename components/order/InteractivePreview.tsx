import React from 'react';
import { Package, User, Palette, Sparkles, BookOpen } from 'lucide-react';
import { PersonalizedProduct } from '../../contexts/AdminContext';

const storyValues = [
    { key: 'courage', title: 'الشجاعة' },
    { key: 'friendship', title: 'الصداقة' },
    { key: 'honesty', title: 'الصدق' },
    { key: 'kindness', title: 'العطف' },
    { key: 'perseverance', title: 'المثابرة' },
];

interface InteractivePreviewProps {
    formData: {
        childName: string;
        characterDescription: string;
        storyValue: string;
        storyCustomValue: string;
    };
    product: PersonalizedProduct | null;
}

const InteractivePreview: React.FC<InteractivePreviewProps> = ({ formData, product }) => {
    const { childName, characterDescription, storyValue, storyCustomValue } = formData;
    
    if (!product) {
        return null; 
    }

    const showFullCustomization = product.key === 'custom_story' || product.key === 'gift_box';
    
    const valueTitle = storyValue === 'custom' ? storyCustomValue : storyValues.find(v => v.key === storyValue)?.title;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100 flex items-center gap-3">
                <Package className="text-blue-500" />
                ملخص طلبك
            </h2>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <BookOpen size={18} />
                        المنتج المطلوب
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xl font-bold text-blue-600 text-center">
                            {product.title}
                        </p>
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <User size={18} />
                        بطل القصة
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600 text-center">
                            {childName || 'اسم الطفل'}
                        </p>
                    </div>
                </div>

                {showFullCustomization && (
                    <>
                        {characterDescription && (
                             <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <Palette size={18} />
                                    وصف الشخصية
                                </h3>
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{characterDescription}</p>
                            </div>
                        )}
                        
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Sparkles size={18} />
                                القيمة التربوية
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600 ps-4">
                                <li>القيمة الأساسية: <span className="font-semibold">{valueTitle || 'لم تختر بعد'}</span></li>
                            </ul>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
                <p>يتم تحديث الملخص تلقائياً أثناء ملء النموذج.</p>
            </div>
        </div>
    );
};

export default InteractivePreview;