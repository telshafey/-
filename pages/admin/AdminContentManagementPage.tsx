import React, { useState, useEffect } from 'react';
import { Save, Loader2, FileText } from 'lucide-react';
// FIX: Added .tsx extension to the import of AdminContext to resolve module loading error.
import { useAdmin, TextContent } from '../../contexts/AdminContext.tsx';
// FIX: Added .tsx extension to useToast import to resolve module error.
import { useToast } from '../../contexts/ToastContext.tsx';
// FIX: Added .tsx extension to PageLoader import to resolve module error.
import PageLoader from '../../components/ui/PageLoader.tsx';
// FIX: Added .tsx extension to Accordion import to resolve module error.
import Accordion from '../../components/ui/Accordion.tsx';

interface TextInputProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    disabled: boolean;
    rows?: number;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, disabled, rows = 1 }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
        {rows > 1 ? (
             <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                rows={rows}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
        ) : (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
        )}
    </div>
);

const AdminContentManagementPage: React.FC = () => {
    const { siteContent, updateSiteContent, loading: isContextLoading } = useAdmin();
    const { addToast } = useToast();
    const [editableContent, setEditableContent] = useState<TextContent | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (siteContent) {
            setEditableContent(JSON.parse(JSON.stringify(siteContent)));
        }
    }, [siteContent]);
    
    const handleContentChange = (pageKey: string, elementKey: string, value: string) => {
        setEditableContent(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [pageKey]: {
                    ...prev[pageKey],
                    [elementKey]: value,
                }
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editableContent) {
            addToast('لا يمكن حفظ المحتوى، البيانات غير متاحة.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            await updateSiteContent(editableContent);
            addToast('تم حفظ المحتوى بنجاح (تجريبيًا)!', 'success');
        } catch (error: any) {
            addToast(error.message || 'حدث خطأ أثناء الحفظ.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isContextLoading || !editableContent) {
        return <PageLoader text="جاري تحميل محرر المحتوى..." />;
    }

    const about = editableContent.about || {};
    const privacy = editableContent.privacy || {};
    const terms = editableContent.terms || {};

    return (
        <div className="animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8">إدارة محتوى الموقع</h1>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <Accordion title="محتوى صفحة 'عنا'">
                        <div className="p-6 space-y-4 bg-gray-50/50">
                            <TextInput label="العنوان الرئيسي" value={about.title} onChange={val => handleContentChange('about', 'title', val)} disabled={isSaving} />
                            <TextInput label="العنوان الفرعي" value={about.subtitle} onChange={val => handleContentChange('about', 'subtitle', val)} disabled={isSaving} />
                            <hr />
                            <TextInput label="عنوان المقدمة" value={about.intro_title} onChange={val => handleContentChange('about', 'intro_title', val)} disabled={isSaving} />
                            <TextInput label="نص المقدمة" value={about.intro_text} onChange={val => handleContentChange('about', 'intro_text', val)} disabled={isSaving} rows={4}/>
                            <hr />
                            <TextInput label="عنوان مشروع 'إنها لك'" value={about.project1_title} onChange={val => handleContentChange('about', 'project1_title', val)} disabled={isSaving} />
                            <TextInput label="نص مشروع 'إنها لك'" value={about.project1_text} onChange={val => handleContentChange('about', 'project1_text', val)} disabled={isSaving} rows={3}/>
                            <hr />
                            <TextInput label="عنوان برنامج 'بداية الرحلة'" value={about.project2_title} onChange={val => handleContentChange('about', 'project2_title', val)} disabled={isSaving} />
                            <TextInput label="نص برنامج 'بداية الرحلة'" value={about.project2_text} onChange={val => handleContentChange('about', 'project2_text', val)} disabled={isSaving} rows={3}/>
                             <hr />
                             <TextInput label="عنوان الخاتمة" value={about.conclusion_title} onChange={val => handleContentChange('about', 'conclusion_title', val)} disabled={isSaving} />
                             <TextInput label="نص الخاتمة" value={about.conclusion_text} onChange={val => handleContentChange('about', 'conclusion_text', val)} disabled={isSaving} rows={3}/>
                        </div>
                    </Accordion>

                    <Accordion title="محتوى صفحة 'شروط الاستخدام'">
                        <div className="p-6 space-y-4 bg-gray-50/50">
                             <TextInput label="العنوان الرئيسي" value={terms.main_title} onChange={val => handleContentChange('terms', 'main_title', val)} disabled={isSaving} />
                             <TextInput label="العنوان الفرعي" value={terms.main_subtitle} onChange={val => handleContentChange('terms', 'main_subtitle', val)} disabled={isSaving} />
                             <hr/>
                             <TextInput label="عنوان الموافقة" value={terms.approval_title} onChange={val => handleContentChange('terms', 'approval_title', val)} disabled={isSaving} />
                             <TextInput label="نص الموافقة" value={terms.approval_text} onChange={val => handleContentChange('terms', 'approval_text', val)} disabled={isSaving} rows={2} />
                             <hr/>
                             <TextInput label="عنوان الملكية الفكرية" value={terms.ip_title} onChange={val => handleContentChange('terms', 'ip_title', val)} disabled={isSaving} />
                             <TextInput label="نص الملكية الفكرية" value={terms.ip_text} onChange={val => handleContentChange('terms', 'ip_text', val)} disabled={isSaving} rows={3} />
                        </div>
                    </Accordion>

                     <Accordion title="محتوى صفحة 'سياسة الخصوصية'">
                        <div className="p-6 space-y-4 bg-gray-50/50">
                           <p className="text-gray-500">جاري إضافة المزيد من الحقول...</p>
                        </div>
                    </Accordion>
                </div>
                
                <div className="flex justify-end sticky bottom-6 mt-8">
                    <button type="submit" disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        <span>{isSaving ? 'جاري الحفظ...' : 'حفظ كل التغييرات'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminContentManagementPage;
