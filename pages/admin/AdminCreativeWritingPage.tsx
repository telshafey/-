import React, { useState, useEffect } from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { Save, Calendar, CheckSquare, Package, Settings, Loader2, Video, Eye } from 'lucide-react';
import { useCreativeWritingAdmin, CreativeWritingPackage, CreativeWritingBooking, AdditionalService } from '../../contexts/admin/CreativeWritingAdminContext';
// FIX: Added .ts extension to resolve module error.
import { getStatusColor } from '../../utils/helpers.ts';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';
import { useToast } from '../../contexts/ToastContext';
// FIX: Added .ts extension to resolve module error.
import { Instructor } from '../../lib/database.types.ts';
import BookingDetailsModal from '../../components/admin/BookingDetailsModal';

const bookingStatusOptions: CreativeWritingBooking['status'][] = ['بانتظار الدفع', 'بانتظار المراجعة', 'مؤكد', 'مكتمل', 'ملغي'];

const AdminCreativeWritingPage: React.FC = () => {
    const { 
        creativeWritingPackages, updateCreativeWritingPackages, 
        creativeWritingBookings, updateBookingStatus, generateAndSetSessionId,
        additionalServices, updateAdditionalServices,
        loading, error
    } = useCreativeWritingAdmin();
    const navigate = ReactRouterDOM.useNavigate();
    const { addToast } = useToast();

    const [editablePackages, setEditablePackages] = useState<CreativeWritingPackage[]>([]);
    const [editableServices, setEditableServices] = useState<AdditionalService[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [startingSession, setStartingSession] = useState<string | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<CreativeWritingBooking | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setEditablePackages(creativeWritingPackages);
    }, [creativeWritingPackages]);
    
    useEffect(() => {
        setEditableServices(additionalServices);
    }, [additionalServices]);

    const handlePackageChange = (index: number, field: keyof CreativeWritingPackage, value: string | number | string[] | boolean) => {
        const newPackages = [...editablePackages];
        const currentPackage = newPackages[index];
        if (!currentPackage) return;

        if(field === 'features' && typeof value === 'string') {
            currentPackage.features = value.split(',').map(f => f.trim());
        } else if (field === 'price' && typeof value === 'string') {
             currentPackage.price = Number(value);
        } else {
            (currentPackage as any)[field] = value;
        }
        setEditablePackages(newPackages);
    };

    const handleServiceChange = (index: number, field: keyof AdditionalService, value: string | number) => {
        const newServices = [...editableServices];
        const currentService = newServices[index];
        if (!currentService) return;

        if (field === 'price' && typeof value === 'string') {
            currentService.price = Number(value);
        } else {
             (currentService as any)[field] = value;
        }
        setEditableServices(newServices);
    };

    const handleBookingStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, bookingId: string, currentStatus: CreativeWritingBooking['status']) => {
        const newStatus = e.target.value as CreativeWritingBooking['status'];

        if (newStatus === 'ملغي') {
            const confirmed = window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟ هذا الإجراء لا يمكن التراجع عنه.');
            if (confirmed) {
                await updateBookingStatus(bookingId, newStatus);
            } else {
                // Revert the select element's value visually
                e.target.value = currentStatus;
            }
        } else {
            await updateBookingStatus(bookingId, newStatus);
        }
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                updateCreativeWritingPackages(editablePackages),
                updateAdditionalServices(editableServices)
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleViewBooking = (booking: CreativeWritingBooking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const handleStartSession = async (booking: CreativeWritingBooking) => {
        setStartingSession(booking.id);
        if (booking.session_id) {
            addToast('جاري الانضمام للجلسة الحالية...', 'info');
            navigate(`/session/${booking.session_id}`);
            return;
        }
        
        const newSessionId = await generateAndSetSessionId(booking.id);
        if (newSessionId) {
            addToast('تم إنشاء رابط الجلسة، جاري التوجيه...', 'success');
            navigate(`/session/${newSessionId}`);
        }
        setStartingSession(null);
    };

    if (loading) {
        return <PageLoader text="جاري تحميل بيانات البرنامج..." />;
    }

    if (error) {
        return <div className="text-center text-red-500 text-lg bg-red-50 p-6 rounded-lg">{error}</div>;
    }

    return (
        <>
            <BookingDetailsModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                booking={selectedBooking}
            />
            <div className="animate-fadeIn space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">إدارة برنامج "بداية الرحلة"</h1>
                
                <AdminSection title="إدارة الباقات والخدمات" icon={<Package />}>
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-700">الباقات الرئيسية</h3>
                        {editablePackages.map((pkg, index) => (
                            <div key={pkg.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-lg border">
                                <input type="text" value={pkg.name} onChange={(e) => handlePackageChange(index, 'name', e.target.value)} placeholder="اسم الباقة" className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                <input type="text" value={pkg.sessions} onChange={(e) => handlePackageChange(index, 'sessions', e.target.value)} placeholder="الجلسات" className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                <div className="md:col-span-2 relative">
                                    <input type="number" value={pkg.price} onChange={(e) => handlePackageChange(index, 'price', e.target.value)} placeholder="السعر" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">ج.م</span>
                                </div>
                                <textarea value={pkg.features.join(', ')} onChange={(e) => handlePackageChange(index, 'features', e.target.value)} placeholder="الميزات (افصل بينها بفاصلة)" className="md:col-span-4 w-full px-3 py-2 border border-gray-300 rounded-lg" rows={1}></textarea>
                                <label className="md:col-span-2 flex items-center justify-center gap-2 cursor-pointer text-sm">
                                    <input type="checkbox" checked={pkg.popular} onChange={(e) => handlePackageChange(index, 'popular', e.target.checked)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500" />
                                    <span>الأكثر شيوعاً</span>
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 mt-8">
                        <h3 className="text-lg font-bold text-gray-700">الخدمات الإضافية</h3>
                        {editableServices.map((service, index) => (
                            <div key={service.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center p-4 bg-gray-50 rounded-lg border">
                                <input type="text" value={service.name} onChange={(e) => handleServiceChange(index, 'name', e.target.value)} placeholder="اسم الخدمة" className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                <div className="md:col-span-1 relative">
                                    <input type="number" value={service.price} onChange={(e) => handleServiceChange(index, 'price', e.target.value)} placeholder="السعر" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">ج.م</span>
                                </div>
                                <input type="text" value={service.description || ''} onChange={(e) => handleServiceChange(index, 'description', e.target.value)} placeholder="وصف الخدمة" className="md:col-span-3 w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <button onClick={handleSaveChanges} disabled={isSaving} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed">
                            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            <span>{isSaving ? 'جاري الحفظ...' : 'حفظ كل التغييرات'}</span>
                        </button>
                    </div>
                </AdminSection>

                <AdminSection title="إدارة الحجوزات" icon={<CheckSquare />}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="border-b-2 border-gray-200">
                                <tr>
                                    <th className="py-3 px-4 font-semibold text-gray-600">المستخدم</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">المدرب</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">التاريخ والوقت</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الباقة</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الحالة</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">الجلسة</th>
                                    <th className="py-3 px-4 font-semibold text-gray-600">تفاصيل</th>
                                </tr>
                            </thead>
                            <tbody>
                                {creativeWritingBookings.length > 0 ? (
                                    creativeWritingBookings.map(booking => {
                                        const instructor = (booking as any).instructors;
                                        return (
                                            <tr key={booking.id} className="border-b hover:bg-gray-50">
                                                <td className="py-4 px-4 font-medium text-gray-800">{booking.user_name}</td>
                                                <td className="py-4 px-4 text-gray-600">{instructor?.name || 'غير محدد'}</td>
                                                <td className="py-4 px-4 text-gray-600">{booking.booking_date} - {booking.booking_time}</td>
                                                <td className="py-4 px-4 text-gray-600">{booking.package_name}</td>
                                                <td className="py-4 px-4">
                                                    <select 
                                                        value={booking.status}
                                                        onChange={(e) => handleBookingStatusChange(e, booking.id, booking.status)}
                                                        className={`border-0 rounded-full text-xs font-bold px-3 py-1 appearance-none ${getStatusColor(booking.status)}`}
                                                    >
                                                    {bookingStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                </td>
                                                <td className="py-4 px-4">
                                                <button
                                                    onClick={() => handleStartSession(booking)}
                                                    disabled={booking.status !== 'مؤكد' || startingSession === booking.id}
                                                    className="flex items-center gap-2 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                                    >
                                                    {startingSession === booking.id ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
                                                    <span>{booking.session_id ? 'الانضمام للجلسة' : 'بدء الجلسة'}</span>
                                                    </button>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <button onClick={() => handleViewBooking(booking)} className="text-gray-500 hover:text-blue-600">
                                                        <Eye size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            لا توجد حجوزات حاليًا.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </AdminSection>
            </div>
        </>
    );
};

export default AdminCreativeWritingPage;