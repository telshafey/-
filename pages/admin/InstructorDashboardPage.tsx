
import React, { useMemo, useState } from 'react';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
// FIX: Added .tsx extension to resolve module error.
import { useAuth } from '../../contexts/AuthContext.tsx';
import { useCreativeWritingAdmin, CreativeWritingBooking } from '../../contexts/admin/CreativeWritingAdminContext';
import AdminSection from '../../components/admin/AdminSection';
import PageLoader from '../../components/ui/PageLoader';
import { getStatusColor } from '../../utils/helpers';
import { Calendar, Video, Loader2, Users, BarChart2, MessageSquare } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import WeeklyScheduleManager from '../../components/admin/WeeklyScheduleManager';

interface Student {
    id: string;
    name: string;
    bookings: CreativeWritingBooking[];
    lastProgressNote: string | null;
}

const InstructorDashboardPage: React.FC = () => {
    const { currentUser, loading: authLoading } = useAuth();
    const { instructors, creativeWritingBookings, generateAndSetSessionId, loading: cwLoading } = useCreativeWritingAdmin();
    const navigate = ReactRouterDOM.useNavigate();
    const { addToast } = useToast();
    const [startingSession, setStartingSession] = React.useState<string | null>(null);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [sessionCount, setSessionCount] = useState<number | null>(null);

    const loading = authLoading || cwLoading;

    const instructorProfile = useMemo(() => {
        if (!currentUser || instructors.length === 0) return null;
        return instructors.find(i => i.user_id === currentUser.id);
    }, [currentUser, instructors]);

    const myStudents = useMemo(() => {
        if (!instructorProfile) return [];
        const studentMap = new Map<string, Student>();
        creativeWritingBookings
            .filter(b => b.instructor_id === instructorProfile.id)
            .forEach(booking => {
                if (!studentMap.has(booking.user_id)) {
                    studentMap.set(booking.user_id, { id: booking.user_id, name: booking.user_name, bookings: [], lastProgressNote: null });
                }
                const student = studentMap.get(booking.user_id)!;
                student.bookings.push(booking);
                if (booking.progress_notes) {
                    student.lastProgressNote = booking.progress_notes;
                }
            });
        return Array.from(studentMap.values());
    }, [instructorProfile, creativeWritingBookings]);

    if (loading || !currentUser) {
        return <PageLoader text="جاري تحميل بيانات المدرب..." />;
    }

    if (!instructorProfile) {
        return <div className="text-center text-red-500">لم يتم العثور على ملف المدرب المرتبط بهذا الحساب.</div>;
    }

    const myUpcomingBookings = creativeWritingBookings.filter(b => b.instructor_id === instructorProfile.id && b.status === 'مؤكد' && new Date(b.booking_date) >= new Date());

    const handleStartSession = async (booking: typeof myUpcomingBookings[0]) => {
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

    const handleFilterSessions = () => {
        if (!dateFrom || !dateTo) {
            addToast('يرجى تحديد تاريخ البداية والنهاية', 'warning');
            return;
        }
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        const count = creativeWritingBookings.filter(b => {
            const bookingDate = new Date(b.booking_date);
            return (
                b.instructor_id === instructorProfile.id &&
                b.status === 'مكتمل' &&
                bookingDate >= from &&
                bookingDate <= to
            );
        }).length;
        setSessionCount(count);
    };

    return (
        <div className="animate-fadeIn space-y-12">
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">أهلاً بعودتك، {currentUser.name.split(' ')[0]}!</h1>
                <p className="mt-2 text-lg text-gray-600">هذه هي لوحة التحكم الخاصة بك لإدارة جلساتك وطلابك.</p>
            </div>

            <AdminSection title="جلساتك القادمة" icon={<Video />}>
                 <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="border-b-2 border-gray-200">
                            <tr>
                                <th className="py-3 px-4 font-semibold text-gray-600">الطالب</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">التاريخ والوقت</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">الحالة</th>
                                <th className="py-3 px-4 font-semibold text-gray-600">إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myUpcomingBookings.length > 0 ? (
                                myUpcomingBookings.map(booking => (
                                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium text-gray-800">{booking.user_name}</td>
                                        <td className="py-4 px-4 text-gray-600">{booking.booking_date.split('T')[0]} - {booking.booking_time}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(booking.status)}`}>{booking.status}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                onClick={() => handleStartSession(booking)}
                                                disabled={startingSession === booking.id}
                                                className="flex items-center gap-2 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                            >
                                                {startingSession === booking.id ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
                                                <span>{booking.session_id ? 'انضم للجلسة' : 'ابدأ الجلسة'}</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-8 text-gray-500">
                                        لا توجد جلسات مؤكدة قادمة.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </AdminSection>
            
             <AdminSection title="طلاب تحت إشرافك" icon={<Users />}>
                <div className="space-y-4">
                    {myStudents.length > 0 ? myStudents.map(student => (
                        <div key={student.id} className="p-4 bg-gray-50 rounded-lg border">
                            <h3 className="font-bold text-gray-800">{student.name}</h3>
                            <p className="text-sm text-gray-500">إجمالي الجلسات: {student.bookings.length}</p>
                            {student.lastProgressNote && (
                                <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-300 text-sm text-blue-800 flex items-start gap-2">
                                   <MessageSquare size={16} className="flex-shrink-0 mt-0.5"/>
                                   <span>آخر ملاحظة: {student.lastProgressNote}</span>
                                </div>
                            )}
                        </div>
                    )) : (
                        <p className="text-center py-8 text-gray-500">لا يوجد طلاب مسجلون معك حاليًا.</p>
                    )}
                </div>
            </AdminSection>

            <AdminSection title="تحليل الجلسات" icon={<BarChart2 />}>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-input rounded-lg border-gray-300" />
                    <span className="text-gray-600">إلى</span>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="form-input rounded-lg border-gray-300" />
                    <button onClick={handleFilterSessions} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
                        عرض
                    </button>
                </div>
                {sessionCount !== null && (
                    <div className="mt-6 text-center bg-blue-50 p-4 rounded-lg">
                        <p className="text-lg text-gray-700">عدد الجلسات المكتملة في هذه الفترة:</p>
                        <p className="text-4xl font-extrabold text-blue-600">{sessionCount}</p>
                    </div>
                )}
            </AdminSection>

            <AdminSection title="إدارة جدولك الأسبوعي" icon={<Calendar />}>
                <WeeklyScheduleManager instructor={instructorProfile} />
            </AdminSection>
        </div>
    );
};

export default InstructorDashboardPage;