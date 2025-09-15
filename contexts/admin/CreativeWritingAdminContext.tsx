import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '../ToastContext';
// FIX: Added .ts extension to resolve module error.
import { Json, Instructor, CreativeWritingPackage, AdditionalService, CreativeWritingBooking, AvailableSlots, WeeklySchedule } from '../../lib/database.types.ts';
// FIX: Added .tsx extension to resolve module error.
import { UserProfile } from '../AuthContext.tsx';

// --- Re-export types ---
export type { Instructor, CreativeWritingPackage, AdditionalService, CreativeWritingBooking, AvailableSlots };

// --- Mock Data ---
const MOCK_INSTRUCTORS: Instructor[] = [
    { id: 1, user_id: 'd1e2f3a4-b5c6-d789-e123-f456a789b0cd', name: 'أحمد المصري', specialty: 'متخصص في كتابة القصة القصيرة', slug: 'ahmed-masri', bio: 'كاتب ومحرر شغوف، متخصص في مساعدة الأطفال على اكتشاف أصواتهم الإبداعية من خلال القصص. لديه خبرة 5 سنوات في ورش عمل الكتابة الإبداعية.', avatar_url: 'https://i.ibb.co/2S4xT8w/male-avatar.png', availability: { '25': ['10:00 ص', '11:00 ص'], '27': ['02:00 م'] }, weekly_schedule: { monday: ['10:00 ص', '11:00 ص'], wednesday: ['02:00 م'] }, schedule_status: 'approved' },
    { id: 2, user_id: null, name: 'نورة خالد', specialty: 'خبيرة في الشعر والنصوص الحرة', slug: 'noura-khaled', bio: 'شاعرة وفنانة، تؤمن بأن لكل طفل قصة تستحق أن تروى. تستخدم أساليب مبتكرة لإطلاق العنان لخيال الأطفال وتحويل أفكارهم إلى كلمات.', avatar_url: 'https://i.ibb.co/yYg5b1c/alrehlah-logo.png', availability: { '26': ['09:00 ص', '12:00 م'], '28': ['03:00 م'] }, weekly_schedule: { tuesday: ['09:00 ص', '12:00 م'], thursday: ['03:00 م'] }, schedule_status: 'pending' },
];

const MOCK_CW_PACKAGES: CreativeWritingPackage[] = [
    { id: 1, name: 'الباقة التأسيسية', sessions: '3 جلسات فردية', price: 1200, features: ['جلسة تعريفية', '3 جلسات فردية', 'متابعة عبر البريد'], popular: false },
    { id: 2, name: 'الباقة التطويرية', sessions: '8 جلسات فردية', price: 2800, features: ['8 جلسات فردية', 'ملف إنجاز رقمي', 'جلسة ختامية مع ولي الأمر'], popular: true },
    { id: 3, name: 'الباقة المتقدمة', sessions: '12 جلسة فردية', price: 4000, features: ['12 جلسة فردية', 'مشروع كتابي متكامل', 'نشر القصة في مدونة المنصة'], popular: false },
    { id: 4, name: 'جلسة استشارية', sessions: 'جلسة واحدة', price: 500, features: ['تقييم مستوى', 'خطة تطوير شخصية', 'إجابة على الاستفسارات'], popular: false },
];

const MOCK_ADDITIONAL_SERVICES: AdditionalService[] = [
    { id: 1, name: 'جلسة متابعة إضافية', price: 450, description: 'جلسة فردية إضافية بعد انتهاء الباقة.' },
    { id: 2, name: 'تحرير وتدقيق لغوي', price: 200, description: 'مراجعة احترافية لنصوص الطالب.' },
    { id: 3, name: 'نشر إلكتروني', price: 300, description: 'تصميم ونشر عمل الطالب ككتاب إلكتروني.' },
];

const MOCK_CW_BOOKINGS: (CreativeWritingBooking & { instructors: Instructor | null })[] = [
    { id: 'BK-1', user_id: 'f1e2d3c4-b5a6-9870-4321-098765fedcba', user_name: 'فاطمة علي', instructor_id: 1, package_id: 2, package_name: 'الباقة التطويرية', booking_date: new Date('2024-07-25T10:00:00Z').toISOString(), booking_time: '10:00 ص', status: 'مكتمل', total: 2800, session_id: 'abc-123', receipt_url: 'https://example.com/receipt.jpg', admin_comment: null, progress_notes: 'أظهرت سارة تقدماً ملحوظاً في بناء الشخصيات. تحتاج للتركيز على الحوار.', instructors: MOCK_INSTRUCTORS[0] },
    { id: 'BK-2', user_id: '12345678-abcd-efgh-ijkl-mnopqrstuvwx', user_name: 'أحمد محمود', instructor_id: 2, package_id: 1, package_name: 'الباقة التأسيسية', booking_date: '2024-07-26', booking_time: '09:00 ص', status: 'بانتظار الدفع', total: 1200, session_id: null, receipt_url: null, admin_comment: null, progress_notes: null, instructors: MOCK_INSTRUCTORS[1] },
    { id: 'BK-3', user_id: 'student-id-123', user_name: 'الطالب عمر', instructor_id: 1, package_id: 2, package_name: 'الباقة التطويرية', booking_date: new Date().toISOString(), booking_time: '11:00 ص', status: 'مؤكد', total: 2800, session_id: 'def-456', receipt_url: 'https://example.com/receipt.jpg', admin_comment: null, progress_notes: 'الجلسة القادمة ستركز على الحبكة.', instructors: MOCK_INSTRUCTORS[0] },

];

// Helper to get next date for a given day of the week
const getNextDateForDay = (dayOfWeek: keyof WeeklySchedule): Date => {
    const dayMapping: { [key in keyof WeeklySchedule]: number } = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
    };
    const targetDay = dayMapping[dayOfWeek];
    const today = new Date();
    const currentDay = today.getDay();
    const distance = (targetDay - currentDay + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + distance);
    return nextDate;
};


// --- Context Definition ---

interface CreativeWritingAdminContextType {
    instructors: Instructor[];
    addInstructor: (payload: { name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; }) => Promise<void>;
    updateInstructor: (payload: { id: number; name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; }) => Promise<void>;
    updateInstructorAvailability: (instructorId: number, availability: AvailableSlots) => Promise<void>;
    approveInstructorSchedule: (instructorId: number) => Promise<void>;
    rejectInstructorSchedule: (instructorId: number) => Promise<void>;
    requestScheduleChange: (instructorId: number, schedule: WeeklySchedule) => Promise<void>;

    creativeWritingPackages: CreativeWritingPackage[];
    updateCreativeWritingPackages: (packages: CreativeWritingPackage[]) => Promise<void>;
    
    additionalServices: AdditionalService[];
    updateAdditionalServices: (services: AdditionalService[]) => Promise<void>;
    
    creativeWritingBookings: (CreativeWritingBooking & { instructors: Instructor | null })[];
    updateBookingStatus: (bookingId: string, newStatus: CreativeWritingBooking['status']) => Promise<void>;
    updateBookingProgressNotes: (bookingId: string, notes: string) => Promise<void>;
    createBooking: (payload: any) => Promise<void>;
    generateAndSetSessionId: (bookingId: string) => Promise<string | null>;
    
    loading: boolean;
    error: string | null;
}

const CreativeWritingAdminContext = createContext<CreativeWritingAdminContextType | undefined>(undefined);

export const CreativeWritingAdminProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [creativeWritingPackages, setCreativeWritingPackages] = useState<CreativeWritingPackage[]>([]);
    const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
    const [creativeWritingBookings, setCreativeWritingBookings] = useState<(CreativeWritingBooking & { instructors: Instructor | null })[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        await new Promise(res => setTimeout(res, 200)); 
        setInstructors(MOCK_INSTRUCTORS);
        setCreativeWritingPackages(MOCK_CW_PACKAGES);
        setAdditionalServices(MOCK_ADDITIONAL_SERVICES);
        setCreativeWritingBookings(MOCK_CW_BOOKINGS);
        setLoading(false);
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addInstructor = async (payload: { name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; }) => {
        const newId = Math.max(...instructors.map(i => i.id), 0) + 1;
        const newInstructor: Instructor = {
            id: newId,
            user_id: null, // Instructors created via UI won't have a login initially
            name: payload.name,
            specialty: payload.specialty,
            slug: payload.slug,
            bio: payload.bio,
            avatar_url: payload.avatarFile ? URL.createObjectURL(payload.avatarFile) : null,
            availability: {},
            weekly_schedule: {},
            schedule_status: null,
        };
        setInstructors(prev => [...prev, newInstructor]);
        addToast('تمت إضافة المدرب بنجاح (تجريبيًا).', 'success');
    };

    const updateInstructor = async (payload: { id: number; name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; }) => {
        setInstructors(prev => prev.map(i => {
            if (i.id === payload.id) {
                return {
                    ...i,
                    name: payload.name,
                    specialty: payload.specialty,
                    slug: payload.slug,
                    bio: payload.bio,
                    avatar_url: payload.avatarFile ? URL.createObjectURL(payload.avatarFile) : i.avatar_url,
                };
            }
            return i;
        }));
        addToast('تم تحديث بيانات المدرب بنجاح (تجريبيًا).', 'success');
    };

    const updateInstructorAvailability = async (instructorId: number, availability: AvailableSlots) => {
        setInstructors(prev => prev.map(i => i.id === instructorId ? { ...i, availability: availability as Json } : i));
    };
    
    const approveInstructorSchedule = async (instructorId: number) => {
        setInstructors(prev => prev.map(i => i.id === instructorId ? { ...i, schedule_status: 'approved' } : i));
        addToast('تمت الموافقة على الجدول.', 'success');
    };

    const rejectInstructorSchedule = async (instructorId: number) => {
        setInstructors(prev => prev.map(i => i.id === instructorId ? { ...i, schedule_status: 'rejected' } : i));
        addToast('تم رفض الجدول.', 'warning');
    };

    const requestScheduleChange = async (instructorId: number, schedule: WeeklySchedule) => {
        setInstructors(prev => prev.map(i => i.id === instructorId ? { ...i, schedule_status: 'pending', weekly_schedule: schedule as Json } : i));
        addToast('تم إرسال الجدول للمراجعة.', 'info');
    };

    const updateCreativeWritingPackages = async (packages: CreativeWritingPackage[]) => {
        setCreativeWritingPackages(packages);
        addToast('تم تحديث الباقات بنجاح (تجريبيًا).', 'success');
    };

    const updateAdditionalServices = async (services: AdditionalService[]) => {
        setAdditionalServices(services);
        addToast('تم تحديث الخدمات الإضافية بنجاح (تجريبيًا).', 'success');
    };
    
    const createBooking = async (payload: { currentUser: UserProfile; instructorId: number; selectedPackage: CreativeWritingPackage; selectedServices: AdditionalService[]; recurringDay: keyof WeeklySchedule; recurringTime: string; }) => {
        const bookingDate = getNextDateForDay(payload.recurringDay);
        const total = payload.selectedPackage.price + payload.selectedServices.reduce((sum, s) => sum + s.price, 0);

        const newBooking: CreativeWritingBooking & { instructors: Instructor | null } = {
            id: `BK-${Date.now()}`,
            user_id: payload.currentUser.id,
            user_name: payload.currentUser.name,
            instructor_id: payload.instructorId,
            package_id: payload.selectedPackage.id,
            package_name: payload.selectedPackage.name,
            booking_date: bookingDate.toISOString().split('T')[0],
            booking_time: payload.recurringTime,
            status: 'بانتظار الدفع',
            total: total,
            session_id: null,
            receipt_url: null,
            admin_comment: null,
            progress_notes: 'تم الحجز، بانتظار الجلسة الأولى.',
            instructors: instructors.find(i => i.id === payload.instructorId) || null,
        };
        setCreativeWritingBookings(prev => [newBooking, ...prev]);
        console.log("Mock Booking Created:", newBooking);
    };

    const updateBookingStatus = async (bookingId: string, newStatus: CreativeWritingBooking['status']) => {
        setCreativeWritingBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        addToast('تم تحديث حالة الحجز (تجريبيًا).', 'success');
    };
    
    const updateBookingProgressNotes = async (bookingId: string, notes: string) => {
        setCreativeWritingBookings(prev => prev.map(b => b.id === bookingId ? { ...b, progress_notes: notes } : b));
    };

    const generateAndSetSessionId = async (bookingId: string) => {
        const newSessionId = `mock-session-${Math.random().toString(36).substring(7)}`;
        setCreativeWritingBookings(prev => prev.map(b => b.id === bookingId ? { ...b, session_id: newSessionId } : b));
        return newSessionId;
    };

    return (
        <CreativeWritingAdminContext.Provider value={{
            instructors,
            addInstructor,
            updateInstructor,
            updateInstructorAvailability,
            approveInstructorSchedule,
            rejectInstructorSchedule,
            requestScheduleChange,
            creativeWritingPackages,
            updateCreativeWritingPackages,
            additionalServices,
            updateAdditionalServices,
            creativeWritingBookings,
            updateBookingStatus,
            updateBookingProgressNotes,
            createBooking,
            generateAndSetSessionId,
            loading,
            error,
        }}>
            {children}
        </CreativeWritingAdminContext.Provider>
    );
};

export const useCreativeWritingAdmin = (): CreativeWritingAdminContextType => {
    const context = useContext(CreativeWritingAdminContext);
    if (context === undefined) {
        throw new Error('useCreativeWritingAdmin must be used within a CreativeWritingAdminProvider');
    }
    return context;
};