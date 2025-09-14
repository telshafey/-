import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, Edit, X, Save, Loader2, Calendar, Check, XCircle } from 'lucide-react';
import { useCreativeWritingAdmin } from '../../contexts/admin/CreativeWritingAdminContext';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';
import AvailabilityManager from '../../components/admin/AvailabilityManager';
// FIX: Added .ts extension to resolve module error.
import { WeeklySchedule, Instructor } from '../../lib/database.types.ts';

// InstructorModal Component
const InstructorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (details: { name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; id?: number }) => void;
    instructor: Instructor | null;
    isSaving: boolean;
}> = ({ isOpen, onClose, onSave, instructor, isSaving }) => {
    const [name, setName] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [slug, setSlug] = useState('');
    const [bio, setBio] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (instructor) {
            setName(instructor.name);
            setSpecialty(instructor.specialty || '');
            setSlug(instructor.slug || '');
            setBio(instructor.bio || '');
            setPreview(instructor.avatar_url || null);
        } else {
            setName('');
            setSpecialty('');
            setSlug('');
            setBio('');
            setPreview(null);
        }
        setAvatarFile(null);
    }, [instructor, isOpen]);
    
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
            setPreview(instructor?.avatar_url || null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: instructor?.id, name, specialty, slug, bio, avatarFile });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="instructor-modal-title">
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 m-4 animate-fadeIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 id="instructor-modal-title" className="text-2xl font-bold text-gray-800">{instructor ? 'تعديل المدرب' : 'إضافة مدرب جديد'}</h2>
                    <button ref={closeButtonRef} onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-4">
                        <img src={preview || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt="Avatar" className="w-20 h-20 rounded-full object-cover bg-gray-200" />
                        <input type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">اسم المدرب</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                    </div>
                     <div>
                        <label htmlFor="specialty" className="block text-sm font-bold text-gray-700 mb-2">التخصص</label>
                        <input type="text" id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="slug" className="block text-sm font-bold text-gray-700 mb-2">معرّف الرابط (Slug)</label>
                        <input type="text" id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="مثال: ahmed-masri" required />
                        <p className="text-xs text-gray-500 mt-1">يُستخدم في رابط الصفحة الشخصية للمدرب. يجب أن يكون فريدًا وبدون مسافات.</p>
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-bold text-gray-700 mb-2">نبذة تعريفية</label>
                        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" rows={4}></textarea>
                    </div>
                    <div className="flex justify-end gap-4 pt-4 mt-8 border-t">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-6 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400">
                           {isSaving ? <Loader2 className="animate-spin"/> : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Main Page Component
const AdminInstructorsPage: React.FC = () => {
    const { instructors, loading, error, addInstructor, updateInstructor, approveInstructorSchedule, rejectInstructorSchedule } = useCreativeWritingAdmin();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleOpenModal = (instructor: Instructor | null) => {
        setSelectedInstructor(instructor);
        setIsModalOpen(true);
    };

    const handleSaveInstructor = async (details: { name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; id?: number }) => {
        setIsSaving(true);
        try {
            if (details.id) {
                await updateInstructor({ ...details, id: details.id });
            } else {
                await addInstructor(details);
            }
            setIsModalOpen(false);
        } catch(e) {
            // Error toast is handled in context
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };
    
    const pendingSchedules = instructors.filter(i => i.schedule_status === 'pending');

    if (loading) return <PageLoader text="جاري تحميل بيانات المدربين..." />;
    if (error) return <div className="text-center text-red-500 text-lg bg-red-50 p-6 rounded-lg">{error}</div>;

    const dayNames = {
        sunday: 'الأحد',
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
    };

    return (
        <>
            <InstructorModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              onSave={handleSaveInstructor} 
              instructor={selectedInstructor} 
              isSaving={isSaving}
            />
            <div className="animate-fadeIn space-y-12">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة المدربين</h1>
                    <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700">
                        <Plus size={18} /><span>إضافة مدرب</span>
                    </button>
                </div>
                
                 {pendingSchedules.length > 0 && (
                    <AdminSection title="طلبات تعديل الجداول" icon={<Calendar />}>
                        <div className="space-y-4">
                            {pendingSchedules.map(instructor => (
                                <div key={instructor.id} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-800">طلب جديد من: {instructor.name}</h3>
                                            <div className="text-sm text-gray-600 mt-2">
                                                {Object.entries((instructor.weekly_schedule as WeeklySchedule) || {}).map(([day, times]) => (
// FIX: Added Array.isArray check to prevent runtime error on `.join` if `times` is not an array.
                                                   (Array.isArray(times) && times.length > 0) && <p key={day}><span className="font-semibold">{dayNames[day as keyof typeof dayNames]}:</span> {times.join(', ')}</p>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => approveInstructorSchedule(instructor.id)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"><Check size={20}/></button>
                                            <button onClick={() => rejectInstructorSchedule(instructor.id)} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"><XCircle size={20}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </AdminSection>
                )}


                <AdminSection title="قائمة المدربين" icon={<Users />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 font-semibold text-gray-600">المدرب</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">التخصص</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">حالة الجدول</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {instructors.map(instructor => (
                                    <tr key={instructor.id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-4 flex items-center gap-3">
                                            <img src={instructor.avatar_url || 'https://i.ibb.co/2S4xT8w/male-avatar.png'} alt={instructor.name} className="w-10 h-10 rounded-full object-cover" />
                                            <span className="font-medium text-gray-800">{instructor.name}</span>
                                        </td>
                                        <td className="py-4 px-4 text-gray-600">{instructor.specialty}</td>
                                         <td className="py-4 px-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                instructor.schedule_status === 'approved' ? 'bg-green-100 text-green-800' :
                                                instructor.schedule_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                instructor.schedule_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {instructor.schedule_status === 'approved' ? 'معتمد' :
                                                 instructor.schedule_status === 'pending' ? 'قيد المراجعة' :
                                                 instructor.schedule_status === 'rejected' ? 'مرفوض' : 'غير محدد'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button onClick={() => handleOpenModal(instructor)} className="text-gray-500 hover:text-blue-600"><Edit size={20} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>

                 <AdminSection title="إدارة المواعيد المتاحة (تجاوز يدوي)" icon={<Calendar />}>
                    <p className="text-gray-600 mb-6 -mt-4">
                        اختر مدربًا ثم اختر يومًا من التقويم لإضافة أو حذف المواعيد المتاحة فيه بشكل مباشر. هذا الإجراء يتجاوز نظام موافقة الجداول.
                    </p>
                    <AvailabilityManager />
                 </AdminSection>
            </div>
        </>
    );
};

export default AdminInstructorsPage;