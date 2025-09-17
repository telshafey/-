import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useToast } from '../ToastContext';
import { supabase } from '../../lib/supabaseClient.ts';
import { Json, Instructor, CreativeWritingPackage, AdditionalService, CreativeWritingBooking, AvailableSlots, WeeklySchedule, InstructorReview } from '../../lib/database.types.ts';
import { UserProfile } from '../AuthContext.tsx';
import { formatDate } from '../../utils/helpers.ts';

// --- Re-export types ---
export type { Instructor, CreativeWritingPackage, AdditionalService, CreativeWritingBooking, AvailableSlots };

const MOCK_AVAILABILITY: { [instructorId: number]: AvailableSlots } = {
    1: { '25': ['10:00 ص', '11:00 ص'], '27': ['02:00 م', '03:00 م', '04:00 م'] },
    2: { '26': ['09:00 ص', '12:00 م'], '28': ['03:00 م', '04:00 م'] },
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
    fetchInstructorAvailability: (instructorId: number) => Promise<void>;

    creativeWritingPackages: CreativeWritingPackage[];
    updateCreativeWritingPackages: (packages: CreativeWritingPackage[]) => Promise<void>;
    addCreativeWritingPackage: (pkg: Omit<CreativeWritingPackage, 'id' | 'created_at'>) => Promise<void>;
    
    additionalServices: AdditionalService[];
    updateAdditionalServices: (services: AdditionalService[]) => Promise<void>;
    addAdditionalService: (service: Omit<AdditionalService, 'id' | 'created_at'>) => Promise<void>;
    
    creativeWritingBookings: (CreativeWritingBooking & { instructors: Instructor | null })[];
    updateBookingStatus: (bookingId: string, newStatus: CreativeWritingBooking['status']) => Promise<void>;
    updateBookingProgressNotes: (bookingId: string, notes: string) => Promise<void>;
    createBooking: (payload: {
        currentUser: UserProfile;
        instructorId: number;
        childId: number;
        selectedPackage: CreativeWritingPackage;
        selectedServices: AdditionalService[];
        bookingDate: Date;
        bookingTime: string;
    }) => Promise<void>;
    generateAndSetSessionId: (bookingId: string) => Promise<string | null>;

    reviews: InstructorReview[];
    addReview: (payload: { instructorId: number; rating: number; comment: string; studentName: string; userId: string; }) => Promise<void>;
    
    loading: boolean;
    error: string | null;
}

const CreativeWritingAdminContext = createContext<CreativeWritingAdminContextType | undefined>(undefined);

export const CreativeWritingAdminProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [creativeWritingPackages, setCreativeWritingPackages] = useState<CreativeWritingPackage[]>([]);
    const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
    const [creativeWritingBookings, setCreativeWritingBookings] = useState<(CreativeWritingBooking & { instructors: Instructor | null })[]>([]);
    const [reviews, setReviews] = useState<InstructorReview[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [
                instructorsRes,
                packagesRes,
                servicesRes,
                bookingsRes,
                reviewsRes
            ] = await Promise.all([
                supabase.from('instructors').select('*').order('created_at', { ascending: true }),
                supabase.from('creative_writing_packages').select('*'),
                supabase.from('additional_services').select('*'),
                supabase.from('creative_writing_bookings').select('*, instructors(*)').order('created_at', { ascending: false }),
                supabase.from('instructor_reviews').select('*').order('created_at', { ascending: false }),
            ]);

            if (instructorsRes.error) throw instructorsRes.error;
            if (packagesRes.error) throw packagesRes.error;
            if (servicesRes.error) throw servicesRes.error;
            if (bookingsRes.error) throw bookingsRes.error;
            if (reviewsRes.error) throw reviewsRes.error;

            setInstructors(instructorsRes.data || []);
            setCreativeWritingPackages(packagesRes.data || []);
            setAdditionalServices(servicesRes.data || []);
            setCreativeWritingBookings(bookingsRes.data as any || []);
            setReviews(reviewsRes.data || []);

        } catch(e: any) {
            setError('فشل تحميل بيانات برنامج الكتابة الإبداعية.');
            addToast(e.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const uploadAvatar = async (file: File, instructorId?: number): Promise<string> => {
        const filePath = `public/${instructorId || 'new'}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('instructor_avatars').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('instructor_avatars').getPublicUrl(filePath);
        return publicUrl;
    };


    const addInstructor = async (payload: { name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; }) => {
        let avatarUrl: string | null = null;
        if (payload.avatarFile) {
            avatarUrl = await uploadAvatar(payload.avatarFile);
        }
        
        const { error } = await supabase.from('instructors').insert([{
            name: payload.name,
            specialty: payload.specialty,
            slug: payload.slug,
            bio: payload.bio,
            avatar_url: avatarUrl,
        }]);

        if (error) {
            addToast(error.message, 'error');
            throw error;
        }
        addToast('تمت إضافة المدرب بنجاح.', 'success');
        await fetchData();
    };

    const updateInstructor = async (payload: { id: number; name: string; specialty: string; slug: string; bio: string; avatarFile: File | null; }) => {
        const originalInstructor = instructors.find(i => i.id === payload.id);
        if (!originalInstructor) throw new Error("Instructor not found");

        let avatarUrl = originalInstructor.avatar_url;
        if (payload.avatarFile) {
            avatarUrl = await uploadAvatar(payload.avatarFile, payload.id);
            // Optionally delete old avatar
        }
        
        const { error } = await supabase.from('instructors').update({
            name: payload.name,
            specialty: payload.specialty,
            slug: payload.slug,
            bio: payload.bio,
            avatar_url: avatarUrl,
        }).eq('id', payload.id);

        if (error) {
            addToast(error.message, 'error');
            throw error;
        }
        addToast('تم تحديث بيانات المدرب بنجاح.', 'success');
        await fetchData();
    };

    const updateInstructorAvailability = async (instructorId: number, availability: AvailableSlots) => {
        const { error } = await supabase.from('instructors').update({ availability: availability as Json }).eq('id', instructorId);
        if (error) {
            addToast(error.message, 'error');
            throw error;
        }
        setInstructors(prev => prev.map(i => i.id === instructorId ? { ...i, availability: availability as Json } : i));
    };
    
    const approveInstructorSchedule = async (instructorId: number) => {
        const { error } = await supabase.from('instructors').update({ schedule_status: 'approved' }).eq('id', instructorId);
        if (error) {
            addToast(error.message, 'error'); throw error;
        }
        addToast('تمت الموافقة على الجدول.', 'success');
        await fetchData();
    };

    const rejectInstructorSchedule = async (instructorId: number) => {
        const { error } = await supabase.from('instructors').update({ schedule_status: 'rejected' }).eq('id', instructorId);
        if (error) {
            addToast(error.message, 'error'); throw error;
        }
        addToast('تم رفض الجدول.', 'warning');
        await fetchData();
    };

    const requestScheduleChange = async (instructorId: number, schedule: WeeklySchedule) => {
        const { error } = await supabase.from('instructors').update({ weekly_schedule: schedule as Json, schedule_status: 'pending' }).eq('id', instructorId);
         if (error) {
            addToast(error.message, 'error'); throw error;
        }
        addToast('تم إرسال الجدول للمراجعة.', 'info');
        await fetchData();
    };

    const fetchInstructorAvailability = async (instructorId: number) => {
        // This remains a mock for now, as planned.
        await new Promise(res => setTimeout(res, 500));
        const availability = MOCK_AVAILABILITY[instructorId];
        if (availability) {
            setInstructors(prev =>
                prev.map(i => i.id === instructorId ? { ...i, availability: availability as Json } : i));
        }
    };
    
    const addReview = async (payload: { instructorId: number; rating: number; comment: string; studentName: string; userId: string; }) => {
        const { error } = await supabase.from('instructor_reviews').insert([
            {
                instructor_id: payload.instructorId,
                rating: payload.rating,
                comment: payload.comment,
                student_name: payload.studentName,
                user_id: payload.userId
            }
        ]);
        if (error) {
            addToast(`فشل إرسال التقييم: ${error.message}`, 'error');
            throw error;
        }
        addToast('شكراً لتقييمك!', 'success');
        await fetchData();
    };

    const createBooking = async (payload: {
        currentUser: UserProfile;
        instructorId: number;
        childId: number;
        selectedPackage: CreativeWritingPackage;
        selectedServices: AdditionalService[];
        bookingDate: Date;
        bookingTime: string;
    }) => {
        const { currentUser, instructorId, childId, selectedPackage, selectedServices, bookingDate, bookingTime } = payload;
        const total = selectedPackage.price + selectedServices.reduce((acc, s) => acc + s.price, 0);

        const newBookingData = {
            id: `BK-${Date.now()}`,
            user_id: currentUser.id,
            user_name: currentUser.name,
            child_id: childId,
            instructor_id: instructorId,
            package_id: selectedPackage.id,
            package_name: selectedPackage.name,
            total: total,
            status: 'بانتظار الدفع' as const,
            booking_date: bookingDate.toISOString().split('T')[0],
            booking_time: bookingTime,
        };

        const { error } = await supabase.from('creative_writing_bookings').insert([newBookingData]);
        if (error) { addToast(`فشل إنشاء الحجز: ${error.message}`, 'error'); throw error; }

        await fetchData(); // to get the new booking
    };

    const generateAndSetSessionId = async (bookingId: string): Promise<string | null> => {
        const sessionId = `${bookingId}-${Math.random().toString(36).substring(2, 9)}`;
        const { error } = await supabase.from('creative_writing_bookings').update({ session_id: sessionId }).eq('id', bookingId);
        if (error) {
            addToast(`فشل إنشاء رابط الجلسة: ${error.message}`, 'error');
            return null;
        }
        await fetchData(); // To refresh state
        return sessionId;
    };
    
    const updateBookingStatus = async (bookingId: string, newStatus: CreativeWritingBooking['status']) => {
        const booking = creativeWritingBookings.find(b => b.id === bookingId);
        if (!booking) return;

        const { error } = await supabase.from('creative_writing_bookings').update({ status: newStatus }).eq('id', bookingId);
        if (error) {
            addToast(`فشل تحديث حالة الحجز: ${error.message}`, 'error'); throw error;
        }
        addToast('تم تحديث حالة الحجز.', 'success');

        // Send notification on confirmation
        if (newStatus === 'مؤكد') {
            const notificationMessage = `تم تأكيد حجزكم لباقة "${booking.package_name}" بتاريخ ${formatDate(booking.booking_date)}.`;
            // FIX: The 'notifications' table does not exist in the provided database schema (database.types.ts).
            // This feature is unimplemented and has been commented out to resolve the error. A console log has been added for debugging purposes.
            console.log(`[Notification Stub] To: ${booking.user_id}, Message: ${notificationMessage}`);
            /*
            const { error: notificationError } = await supabase.from('notifications').insert({
                user_id: booking.user_id,
                message: notificationMessage,
                link: '/account',
                type: 'booking'
            });
            if (notificationError) {
                console.error("Failed to send booking confirmation notification:", notificationError);
            }
            */
        }
        
        await fetchData();
    };

    const updateBookingProgressNotes = async (bookingId: string, notes: string) => {
        const { error } = await supabase.from('creative_writing_bookings').update({ progress_notes: notes }).eq('id', bookingId);
        if (error) {
            addToast(`فشل تحديث الملاحظات: ${error.message}`, 'error'); throw error;
        }
        // No toast to avoid being noisy for instructors. It's an autosave-like feature.
        await fetchData();
    };
    
     const updateCreativeWritingPackages = async (packages: CreativeWritingPackage[]) => {
        const updates = packages.map(p => 
            supabase
                .from('creative_writing_packages')
                .update({ name: p.name, sessions: p.sessions, price: p.price, features: p.features, popular: p.popular })
                .eq('id', p.id)
        );
        const results = await Promise.all(updates);
        const firstError = results.find(res => res.error);
        if (firstError) { addToast(`فشل تحديث الباقات: ${firstError.error.message}`, 'error'); throw firstError.error; }
        addToast('تم تحديث الباقات بنجاح.', 'success');
        await fetchData();
    };

    const addCreativeWritingPackage = async (pkg: Omit<CreativeWritingPackage, 'id' | 'created_at'>) => {
        const { error } = await supabase.from('creative_writing_packages').insert([pkg]);
        if (error) { addToast(`فشل إضافة الباقة: ${error.message}`, 'error'); throw error; }
        addToast('تمت إضافة الباقة بنجاح.', 'success');
        await fetchData();
    };
    
    const updateAdditionalServices = async (services: AdditionalService[]) => {
        const updates = services.map(s => 
            supabase
                .from('additional_services')
                .update({ name: s.name, description: s.description, price: s.price })
                .eq('id', s.id)
        );
        const results = await Promise.all(updates);
        const firstError = results.find(res => res.error);
        if (firstError) { addToast(`فشل تحديث الخدمات: ${firstError.error.message}`, 'error'); throw firstError.error; }
        addToast('تم تحديث الخدمات الإضافية بنجاح.', 'success');
        await fetchData();
    };

    const addAdditionalService = async (service: Omit<AdditionalService, 'id' | 'created_at'>) => {
        const { error } = await supabase.from('additional_services').insert([service]);
        if (error) { addToast(`فشل إضافة الخدمة: ${error.message}`, 'error'); throw error; }
        addToast('تمت إضافة الخدمة بنجاح.', 'success');
        await fetchData();
    };

    const value = {
        instructors, addInstructor, updateInstructor, updateInstructorAvailability, approveInstructorSchedule, rejectInstructorSchedule, requestScheduleChange, fetchInstructorAvailability,
        creativeWritingPackages, updateCreativeWritingPackages, addCreativeWritingPackage,
        additionalServices, updateAdditionalServices, addAdditionalService,
        creativeWritingBookings, updateBookingStatus, updateBookingProgressNotes, createBooking, generateAndSetSessionId,
        reviews, addReview,
        loading, error
    };

    return (
        <CreativeWritingAdminContext.Provider value={value}>
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