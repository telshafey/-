import React from 'react';
import { Package, User, Palette, Sparkles, BookOpen, Award, Target } from 'lucide-react';
import { PersonalizedProduct } from '../../contexts/AdminContext';

const storyValues = [
    { key: 'courage', title: 'الشجاعة' },
    { key: 'friendship', title: 'الصداقة' },
    { key: 'honesty', title: 'الصدق' },
    { key: 'kindness', title: 'العطف' },
    { key: 'perseverance', title: 'المثابرة' },
];

const valuesStoryOptions = [
    { key: 'respect', title: 'الاستئذان والاحترام' },
    { key: 'cooperation', title: 'التعاون والمشاركة' },
    { key: 'honesty', title: 'الصدق والأمانة' },
    { key: 'cleanliness', title: 'النظافة والترتيب' },
];

const skillsStoryOptions = [
    { key: 'time_management', title: 'تنظيم الوقت' },
    { key: 'emotion_management', title: 'إدارة العواطف' },
    { key: 'problem_solving', title: 'حل المشكلات' },
    { key: 'creative_thinking', title: 'التفكير الإبداعي' },
];

interface InteractivePreviewProps {
    formData: {
        childName: string;
        childTraits: string;
        storyValue: string;
        valuesStoryOption: string;
        skillsStoryOption: string;
        customGoal: string;
    };
    product: PersonalizedProduct | null;
}

const InteractivePreview: React.FC<InteractivePreviewProps> = ({ formData, product }) => {
    const { childName, childTraits, storyValue, valuesStoryOption, skillsStoryOption, customGoal } = formData;
    
    if (!product) {
        return null; 
    }

    const showFullCustomization = product.key === 'custom_story' || product.key === 'gift_box';
    const showValuesCustomization = product.key === 'values_story';
    const showSkillsCustomization = product.key === 'skills_story';
    
    const getGoalTitle = () => {
        if (showFullCustomization) {
            return storyValue === 'custom' ? customGoal : storyValues.find(v => v.key === storyValue)?.title;
        }
        if (showValuesCustomization) {
            return valuesStoryOption === 'custom' ? customGoal : valuesStoryOptions.find(v => v.key === valuesStoryOption)?.title;
        }
        if (showSkillsCustomization) {
            return skillsStoryOption === 'custom' ? customGoal : skillsStoryOptions.find(v => v.key === skillsStoryOption)?.title;
        }
        return null;
    };

    const goalTitle = getGoalTitle();
    const goalIcon = showValuesCustomization ? <Award size={18}/> : showSkillsCustomization ? <Target size={18}/> : <Sparkles size={18}/>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-100 flex items-center gap-3">
                <Package className="text-blue-500" />
                معاينة طلبك
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

                {showFullCustomization && childTraits && (
                     <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Palette size={18} />
                            وصف الشخصية
                        </h3>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{childTraits}</p>
                    </div>
                )}
                
                {goalTitle && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            {goalIcon}
                            الهدف من القصة
                        </h3>
                        <p className="text-md text-gray-800 font-semibold bg-gray-50 p-3 rounded-lg text-center">
                           {goalTitle}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
                <p>يتم تحديث الملخص تلقائياً أثناء ملء النموذج.</p>
            </div>
        </div>
    );
};

export default InteractivePreview;