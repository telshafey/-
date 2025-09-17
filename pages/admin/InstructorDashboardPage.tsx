import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Imported 'Star' icon from 'lucide-react' to resolve 'Cannot find name' error.
import { Calendar, CheckSquare, Clock, Users, Video, MessageSquare, ChevronLeft, ChevronRight, Star } from 'lucide-react';
// FIX: Added .tsx extension to resolve module error.
import { useAuth } from '../../contexts/AuthContext.tsx';
// FIX: Corrected import path for useCreativeWritingAdmin.
import { useCreativeWritingAdmin, CreativeWritingBooking } from '../../contexts/admin/CreativeWritingAdminContext.tsx';
// FIX: Added .tsx extension to resolve module error.
import PageLoader from '../../components/ui/PageLoader.tsx';
// FIX: Added .tsx extension to resolve module error.
import AdminSection from '../../components/admin/AdminSection.tsx';
// FIX: Added .tsx extension to resolve module error.
import StatCard from '../../components/admin/StatCard.tsx';
// FIX: Added .ts extension to resolve module error.
import { formatDate } from '../../utils/helpers.ts';
// FIX: Added .tsx extension to resolve module error.
import WeeklyScheduleManager from '../../components/admin/WeeklyScheduleManager.tsx';
// FIX: Added .tsx extension to resolve module error.
import StudentProgressModal from '../../components/admin/StudentProgressModal.tsx';

interface Student {
    id: string; // user_id of the student's parent
    name: string; // parent's name
    bookings: CreativeWritingBooking[];
    lastProgressNote: string | null;
}

const CalendarGrid: React.FC<{ bookings: CreativeWritingBooking[] }> = ({ bookings }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const bookingDates = useMemo(() => 
        new Set(bookings.map(b => new Date(b.booking_date).toDateString())),
    [bookings]);

    const daysInMonth = (date: Date): number => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date: Date): number => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const monthName = currentDate.toLocaleString('ar-EG', { month: 'long' });
    const year = currentDate.getFullYear();

    const renderCalendar = () => {
        const totalDays = daysInMonth(currentDate);
        const startingDay = firstDayOfMonth(currentDate);
        const blanks = Array(startingDay).fill(null);
        const days = Array.from({ length: totalDays }, (_, i) => i + 1);

        return [...blanks, ...days].map((day, index) => {
            if (day === null) {
                return <div key={`blank-${index}`} className="p-2 border border-transparent"></div>;
            }
            const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const hasBooking = bookingDates.has(fullDate.toDateString());

            return (
                <div
                    key={day}
                    className={`
                        p-2 border rounded-lg text-center aspect-square flex flex-col justify-center items-center
                        ${hasBooking ? 'bg-blue-600 text-white font-bold' : 'bg-white border-gray-200'}
                    `}
                >
                    <span className="font-semibold text-lg">{day}</span>
                </div>
            );
        });
    };
    
    return (
         <div>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 rounded-full hover:bg-gray-200"><ChevronRight size={20} /></button>
                <h3 className="text-lg font-bold text-gray-800">{monthName} {year}</h3>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeft size={20} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-500 mb-2 font-semibold">
                {['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
            </div>
        </div>
    );
};


const InstructorDashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { instructors, creativeWritingBookings, reviews, loading, generateAndSetSessionId } = useCreativeWritingAdmin();
    const navigate = useNavigate();

    const [startingSession, setStartingSession] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

    const instructorProfile = useMemo(() => {
        if (!currentUser) return null;
        return instructors.find(i => i.user_id === currentUser.id);
    }, [currentUser, instructors]);

    const myBookings = useMemo(() => {
        if (!instructorProfile) return [];
        return creativeWritingBookings
            .filter(b => b.instructor_id === instructorProfile.id)
            .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());
    }, [instructorProfile, creativeWritingBookings]);
    
    const upcomingSessions = useMemo(() => 
        myBookings.filter(b => b.status === 'مؤكد' && new Date(b.booking_date) >= new Date(new Date().setDate(new Date().getDate() - 1)))
        .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()),
    [myBookings]);

    const myStudents = useMemo(() => {
        const studentMap = new Map<string, Student>();
        myBookings.forEach(booking => {
            const studentId = booking.user_id;
            if (!studentMap.has(studentId)) {
                studentMap.set(studentId, {
                    id: studentId,
                    name: booking.user_name,
                    bookings: [],
                    lastProgressNote: null,
                });
            }
            const studentData = studentMap.get(studentId)!;
            studentData.bookings.push(booking);
            if (booking.status === 'مكتمل' && booking.progress_notes) {
                studentData.lastProgressNote = booking.progress_notes;
            }
        });

        return Array.from(studentMap.values());
    }, [myBookings]);

     const instructorReviews = useMemo(() => {
        if (!instructorProfile) return [];
        return reviews.filter(r => r.instructor_id === instructorProfile.id);
    }, [reviews, instructorProfile]);

    const averageRating = useMemo(() => {
        if (instructorReviews.length === 0) return 0;
        const total = instructorReviews.reduce((acc, review) => acc + review.rating, 0);
        return (total / instructorReviews.length).toFixed(1);
    }, [instructorReviews]);

    const stats = useMemo(() => ({
        totalSessions: myBookings.length,
        completedSessions: myBookings.filter(b => b.status === 'مكتمل').length,
        totalStudents: myStudents.length,
        averageRating: averageRating,
    }), [myBookings, myStudents, averageRating]);

    const handleStartSession = async (booking: CreativeWritingBooking) => {
        setStartingSession(booking.id);
        if (booking.session_id) {
            navigate(`/session/${booking.session_id}`);
            return;
        }
        const newSessionId = await generateAndSetSessionId(booking.id);
        if (newSessionId) {
            navigate(`/session/${newSessionId}`);
        }
        setStartingSession(null);
    };

    const handleOpenProgressModal = (student: Student) => {
        setSelectedStudent(student);
        setIsProgressModalOpen(true);
    };

    if (loading) {
        return <PageLoader text="جاري تحميل لوحة التحكم..." />;
    }

    if (!instructorProfile) {
        return (
            <div className="text-center py-20">
                <p className="text-lg text-red-500">لم يتم العثور على ملف المدرب المرتبط بحسابك.</p>
            </div>
        );
    }

    return (
        <>
            <StudentProgressModal 
                isOpen={isProgressModalOpen}
                onClose={() => setIsProgressModalOpen(false)}
                student={selectedStudent}
            />
            <div className="animate-fadeIn space-y-12">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">أهلاً بعودتك، {instructorProfile.name}!</h1>
                    <p className="mt-2 text-lg text-gray-600">هنا يمكنك إدارة جلساتك وجدول مواعيدك.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="إجمالي الجلسات" value={stats.totalSessions} icon={<Calendar className="text-white" />} color="bg-blue-500" />
                    <StatCard title="الجلسات المكتملة" value={stats.completedSessions} icon={<CheckSquare className="text-white" />} color="bg-green-500" />
                    <StatCard title="إجمالي الطلاب" value={stats.totalStudents} icon={<Users className="text-white" />} color="bg-indigo-500" />
                    {/* FIX: Replaced the 'Users' icon with 'Star' for the average rating StatCard to improve UI consistency. */}
                    <StatCard title="متوسط التقييم" value={stats.averageRating} icon={<Star className="text-white" />} color="bg-yellow-500" />
                </div>
                
                 <AdminSection title="التقويم الشهري" icon={<Calendar />}>
                    <CalendarGrid bookings={myBookings} />
                </AdminSection>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AdminSection title="الجلسات القادمة" icon={<Clock />}>
                        {upcomingSessions.length > 0 ? (
                             <div className="space-y-4 max-h-96 overflow-y-auto">
                                {upcomingSessions.map((session, index) => (
                                    <div key={session.id} className={`p-4 rounded-lg flex justify-between items-center ${index === 0 ? 'bg-blue-100 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
                                        <div>
                                            <p className={`font-bold ${index === 0 ? 'text-blue-800' : 'text-gray-800'}`}>طالب: {session.user_name}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                                <span className="flex items-center gap-1.5"><Calendar size={14}/> {formatDate(session.booking_date)}</span>
                                                <span className="flex items-center gap-1.5"><Clock size={14}/> {session.booking_time}</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleStartSession(session)} 
                                            disabled={startingSession === session.id}
                                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 flex items-center gap-2 disabled:bg-blue-300">
                                            <Video size={16}/>
                                            <span>{session.session_id ? 'انضم' : 'ابدأ'}</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">لا توجد جلسات قادمة مجدولة.</p>
                        )}
                    </AdminSection>
                     <AdminSection title="آخر تقييمات الطلاب" icon={<MessageSquare />}>
                        {instructorReviews.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {instructorReviews.slice(0, 5).map(review => (
                                    <div key={review.id} className="p-3 bg-gray-50 rounded-lg border">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-semibold text-gray-800">{review.student_name}</p>
                                            <div className="flex items-center">
                                                {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} className="text-yellow-400" fill="currentColor"/>)}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <p className="text-center text-gray-500 py-8">لا توجد تقييمات بعد.</p>
                        )}
                    </AdminSection>
                </div>

                <AdminSection title="جدولي الأسبوعي" icon={<Calendar />}>
                    <p className="text-gray-600 mb-6 -mt-4">
                        هنا يمكنك تحديد الأوقات المتكررة التي تكون متاحًا فيها أسبوعيًا. سيتم إرسال أي تغييرات للموافقة عليها من قبل الإدارة.
                    </p>
                    <WeeklyScheduleManager instructor={instructorProfile} />
                </AdminSection>

            </div>
        </>
    );
};

export default InstructorDashboardPage;
