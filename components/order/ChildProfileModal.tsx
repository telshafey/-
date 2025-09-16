import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, User, Image as ImageIcon } from 'lucide-react';
// FIX: Added .tsx extension to resolve module error.
import { useAuth } from '../../contexts/AuthContext.tsx';
// FIX: Added .ts extension to resolve module error.
import { ChildProfile } from '../../lib/database.types.ts';

interface ChildProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    childToEdit: ChildProfile | null;
}

const ChildProfileModal: React.FC<ChildProfileModalProps> = ({ isOpen, onClose, childToEdit }) => {
    const { addChildProfile, updateChildProfile } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'ذكر' | 'أنثى'>('ذكر');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);


    useEffect(() => {
        if (isOpen) {
            if (childToEdit) {
                setName(childToEdit.name);
                setAge(childToEdit.age.toString());
                setGender(childToEdit.gender);
                setPreview(childToEdit.avatar_url);
            } else {
                setName('');
                setAge('');
                setGender('ذكر');
                setPreview(null);
            }
            setAvatarFile(null);
        }
    }, [childToEdit, isOpen]);
    
     useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        const focusableElements = modalRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        closeButtonRef.current?.focus();

        const handleTabKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) { 
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        event.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        event.preventDefault();
                    }
                }
            }
        };
        
        const currentModalRef = modalRef.current;
        currentModalRef?.addEventListener('keydown', handleTabKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            currentModalRef?.removeEventListener('keydown', handleTabKeyPress);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setAvatarFile(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(childToEdit?.avatar_url || null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const profileData = {
                name,
                age: parseInt(age),
                gender,
                avatarFile,
            };
            if (childToEdit) {
                await updateChildProfile({ ...profileData, id: childToEdit.id, avatar_url: childToEdit.avatar_url });
            } else {
                // FIX: Add avatar_url to satisfy the type requirement for addChildProfile.
                // The argument was missing the `avatar_url` property which is required by the function's type signature.
                await addChildProfile({ ...profileData, avatar_url: null });
            }
            onClose();
        } catch (error) {
            console.error("Failed to save child profile", error);
            // Toast will be shown from context
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="child-profile-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 m-4 animate-fadeIn" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="child-profile-modal-title" className="text-2xl font-bold text-gray-800">{childToEdit ? 'تعديل ملف الطفل' : 'إضافة طفل جديد'}</h2>
                    <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <img src={preview || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt="Avatar" className="w-24 h-24 rounded-full object-cover bg-gray-200" loading="lazy" />
                        <input type="file" id="avatar-upload" onChange={handleFileChange} accept="image/*" className="hidden"/>
                        <label htmlFor="avatar-upload" className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full">
                           <ImageIcon size={16} /> <span>{preview ? 'تغيير الصورة الرمزية' : 'رفع صورة رمزية'}</span>
                        </label>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">اسم الطفل*</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="age" className="block text-sm font-bold text-gray-700 mb-2">العمر*</label>
                            <input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-bold text-gray-700 mb-2">الجنس*</label>
                            <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as 'ذكر' | 'أنثى')} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white">
                                <option value="ذكر">ذكر</option>
                                <option value="أنثى">أنثى</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="w-32 flex items-center justify-center px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                           {isSaving ? <Loader2 className="animate-spin"/> : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChildProfileModal;