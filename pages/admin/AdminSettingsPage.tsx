import React, { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, X, Loader2, Share2 } from 'lucide-react';
import { useAdmin, TextContent } from '../../contexts/AdminContext';
import type { SocialLinks } from '../../lib/database.types';
import { useToast } from '../../contexts/ToastContext';
import { useProduct, SiteBranding } from '../../contexts/ProductContext';

const ImageUploadControl: React.FC<{
    label: string;
    currentImage: string;
    newImagePreview: string | null;
    onFileSelect: (file: File) => void;
    onCancel: () => void;
    disabled: boolean;
}> = ({ label, currentImage, newImagePreview, onFileSelect, onCancel, disabled }) => {
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg border">
            <label className="block text-sm font-bold text-gray-700 mb-3">{label}</label>
            <div className="flex items-center gap-4">
                <img src={newImagePreview || currentImage} alt={label} className="w-24 h-24 object-contain rounded-md bg-white shadow-sm" />
                <div className="flex-grow">
                    <input type="file" disabled={disabled} accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"/>
                     {newImagePreview && (
                        <button onClick={onCancel} disabled={disabled} type="button" className="mt-2 flex items-center gap-1 text-sm text-red-600 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full disabled:opacity-50">
                            <X size={14} /> إلغاء التغيير
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const TextInput: React.FC<{label: string; value: string; onChange: (val: string) => void; disabled: boolean; placeholder?: string;}> = ({ label, value, onChange, disabled, placeholder }) => (
    <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            placeholder={placeholder}
        />
    </div>
);

const AdminSettingsPage: React.FC = () => {
    const { socialLinks, updateSocialLinks, loading: isContentLoading } = useAdmin();
    const { siteBranding, setSiteBranding, loading: isBrandingLoading } = useProduct();
    const { addToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    
    const [editableBranding, setEditableBranding] = useState<SiteBranding | null>(siteBranding);
    const [imageFiles, setImageFiles] = useState<{ logo?: File, hero?: File, about?: File, creativeWritingLogo?: File }>({});
    const [imagePreviews, setImagePreviews] = useState<{ logo?: string, hero?: string, about?: string, creativeWritingLogo?: string }>({});

    const [editableSocials, setEditableSocials] = useState<SocialLinks>(socialLinks);
    
    useEffect(() => { setEditableBranding(siteBranding); }, [siteBranding]);
    useEffect(() => { setEditableSocials(socialLinks); }, [socialLinks]);


    const handleSocialChange = (key: keyof SocialLinks, value: string) => {
        setEditableSocials(prev => ({ ...prev, [key]: value }));
    };

    const handleImageSelect = (key: 'logo' | 'hero' | 'about' | 'creativeWritingLogo', file: File) => {
        setImageFiles(prev => ({ ...prev, [key]: file }));
        setImagePreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    };

    const handleCancelImage = (key: 'logo' | 'hero' | 'about' | 'creativeWritingLogo') => {
        setImageFiles(prev => { const newFiles = {...prev}; delete newFiles[key]; return newFiles; });
        setImagePreviews(prev => { const newPreviews = {...prev}; delete newPreviews[key]; return newPreviews; });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const brandingChanges: Partial<SiteBranding> = {};
            for (const key of Object.keys(imageFiles) as Array<keyof typeof imageFiles>) {
                const file = imageFiles[key];
                if (!file) continue;
                
                // In a real scenario, we'd upload and get a URL. Here, we'll just use the preview URL for the mock.
                const previewUrl = imagePreviews[key];
                if (key === 'logo') brandingChanges.logoUrl = previewUrl;
                if (key === 'hero') brandingChanges.heroImageUrl = previewUrl;
                if (key === 'about') brandingChanges.aboutImageUrl = previewUrl;
                if (key === 'creativeWritingLogo') brandingChanges.creativeWritingLogoUrl = previewUrl;
            }

            if (Object.keys(brandingChanges).length > 0) {
                await setSiteBranding(brandingChanges);
            }
            if(JSON.stringify(editableSocials) !== JSON.stringify(socialLinks)) {
                await updateSocialLinks(editableSocials);
            }

            addToast('تم حفظ التغييرات (تجريبيًا)!', 'success');
            setImageFiles({});
            
        } catch (error: any) {
            addToast(error.message || 'حدث خطأ أثناء حفظ التغييرات.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const isContextLoading = isBrandingLoading || isContentLoading;

    if (isContextLoading || !editableBranding) {
      return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 animate-spin text-blue-500" /></div>;
    }

    return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-8">إدارة الموقع</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-8 rounded-2xl shadow-md">
                <div className="space-y-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">تعديل الصور والشعار</h2>
                        <div className="space-y-6">
                            <ImageUploadControl 
                                label="شعار موقع 'إنها لك' (الرئيسي)" 
                                currentImage={editableBranding.logoUrl || ''}
                                newImagePreview={imagePreviews.logo || null}
                                onFileSelect={(file) => handleImageSelect('logo', file)}
                                onCancel={() => handleCancelImage('logo')}
                                disabled={isSaving}
                            />
                             <ImageUploadControl 
                                label="شعار برنامج الكتابة الإبداعية" 
                                currentImage={editableBranding.creativeWritingLogoUrl || ''}
                                newImagePreview={imagePreviews.creativeWritingLogo || null}
                                onFileSelect={(file) => handleImageSelect('creativeWritingLogo', file)}
                                onCancel={() => handleCancelImage('creativeWritingLogo')}
                                disabled={isSaving}
                            />
                            <ImageUploadControl 
                                label="صورة الواجهة الرئيسية" 
                                currentImage={editableBranding.heroImageUrl || ''}
                                newImagePreview={imagePreviews.hero || null}
                                onFileSelect={(file) => handleImageSelect('hero', file)}
                                onCancel={() => handleCancelImage('hero')}
                                disabled={isSaving}
                            />
                            <ImageUploadControl 
                                label="صورة صفحة 'عنا'" 
                                currentImage={editableBranding.aboutImageUrl || ''}
                                newImagePreview={imagePreviews.about || null}
                                onFileSelect={(file) => handleImageSelect('about', file)}
                                onCancel={() => handleCancelImage('about')}
                                disabled={isSaving}
                            />
                        </div>
                    </div>
                     <div className="p-4 bg-gray-50 rounded-lg border">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Share2 size={20}/> تعديل روابط التواصل الاجتماعي</h2>
                        <div className="space-y-4">
                           <TextInput label="رابط صفحة فيسبوك" value={editableSocials.facebook_url || ''} onChange={val => handleSocialChange('facebook_url', val)} disabled={isSaving} placeholder="اتركه فارغاً لإخفاء الأيقونة" />
                           <TextInput label="رابط صفحة تويتر" value={editableSocials.twitter_url || ''} onChange={val => handleSocialChange('twitter_url', val)} disabled={isSaving} placeholder="اتركه فارغاً لإخفاء الأيقونة" />
                           <TextInput label="رابط صفحة انستغرام" value={editableSocials.instagram_url || ''} onChange={val => handleSocialChange('instagram_url', val)} disabled={isSaving} placeholder="اتركه فارغاً لإخفاء الأيقونة" />
                        </div>
                    </div>
                </div>
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

export default AdminSettingsPage;
